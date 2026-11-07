import { Fragment } from "react";

// Texto simples com **negrito**. Ex.: "atende o **iniciante** ao **avançado**"
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}