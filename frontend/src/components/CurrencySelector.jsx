export function useCurrency() {
  const currency = 'TOMAN';
  const setCurrency = () => {};
  const convertPrice = (price) => price;

  return { currency, setCurrency, convertPrice };
}

export default function CurrencySelector() {
  return null;
}
