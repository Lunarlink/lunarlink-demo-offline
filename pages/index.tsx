import Products from '../components/Products'
import SiteHeading from '../components/SiteHeading'

export default function ShopPage() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl items-stretch m-auto">
      <SiteHeading>Lunar MegaStore</SiteHeading>
      <Products submitTarget='/checkout' enabled={true} />    </div>
  )
}