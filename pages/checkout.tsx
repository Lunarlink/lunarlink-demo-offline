import { createQR, encodeURL, TransferRequestURLFields, findReference, validateTransfer, FindReferenceError, ValidateTransferError, TransactionRequestURLFields } from "@solana/pay";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import BackLink from "../components/BackLink";
import PageHeading from "../components/PageHeading";
import { shopAddress, usdcAddress } from "../lib/addresses";
import calculatePrice from "../lib/calculatePrice";
import { makeSearchParams } from "../lib/searchParams";

export default function Checkout() {
  const router = useRouter()

  const partnerId = process.env.PARTNER_ID as string
  const backendApi = process.env.BACKEND_API as string

  // ref to a div where we'll show the QR code
  const qrRef = useRef<HTMLDivElement>(null)

  const amount = useMemo(() => calculatePrice(router.query), [router.query])

  // Unique address that we can listen for payments to
  const reference = useMemo(() => Keypair.generate().publicKey, [])

  // Get a connection to Solana devnet
  const network = WalletAdapterNetwork.Devnet
  const endpoint = clusterApiUrl(network)
  const connection = new Connection(endpoint)

  // Show the QR code
  useEffect(() => {
    // window.location is only available in the browser, so create the URL in here
    const { location } = window

    // const searchParams = makeSearchParams(router.query)
    const searchParams = new URLSearchParams()
    // Add reference to the params we'll pass to the API
    searchParams.append('reference', reference.toString());
    searchParams.append('amount', amount.toString());
    searchParams.append('pid', partnerId);

    const usePoints = router.query.usePoints === 'on';
    searchParams.append('usePoints', usePoints.toString());

    console.log('searchParams', searchParams.toString())

    const apiUrl = `${backendApi}/transaction?${searchParams.toString()}`
    console.log('apiUrl', apiUrl)
    const urlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    }
    const solanaUrl = encodeURL(urlParams)
    const qr = createQR(solanaUrl, 512, 'transparent')
    if (qrRef.current && amount.isGreaterThan(0)) {
      qrRef.current.innerHTML = ''
      qr.append(qrRef.current)
    }
  })

  // Check every 0.5s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })
        router.push('/confirmed')
      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        if (e instanceof ValidateTransferError) {
          // Transaction is invalid
          console.error('Transaction is invalid', e)
          return;
        }
        console.error('Unknown error', e)
      }
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  if (amount.isZero()) {
    return (
      <div className="flex flex-col items-center gap-8">
        <BackLink href='/'>Cancel</BackLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <BackLink href='/'>Cancel</BackLink>

      <PageHeading>Checkout ${amount.toString()}</PageHeading>

      {/* div added to display the QR code */}
      <div ref={qrRef} />
    </div>
  )
}