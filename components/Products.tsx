import { useRef } from "react";
import { products } from "../lib/products"
import NumberInput from "./NumberInput";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

export default function Products({ submitTarget, enabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form method='get' action={submitTarget} ref={formRef}>
      <div className='flex flex-col gap-8'>
        <div className="grid grid-cols-2 gap-8">
          {products.map(product => {
            return (
              <div className="rounded-md bg-white text-left p-8" key={product.id}>
                <img src={product.image} alt={product.name} className="w-64 h-64" />
                <h3 className="text-2xl font-bold">{product.name}</h3>
                {/* <p className="text-sm text-gray-800">{product.description}</p> */}
                <p className="my-4">
                  <span className="mt-4 text-xl font-bold">${product.priceUsd}</span>
                  {/* {product.unitName && <span className="text-sm text-gray-800"> /{product.unitName}</span>} */}
                </p>
                <div className="mt-1">
                  <NumberInput name={product.id} formRef={formRef} />
                </div>
              </div>
            )
          })}

        </div>

        <div className="flex self-center" hidden={!enabled}>
          <input name='usePoints' type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
          <label className="ml-2 max-w-fit "> Use Reward Points</label>
        </div>  
        <button
          className="items-center px-20 rounded-md py-2 max-w-fit self-center bg-gray-900 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!enabled}
        >
          Checkout
        </button>
      </div>
    </form>
  )
}
