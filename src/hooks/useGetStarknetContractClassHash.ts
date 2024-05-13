import { useEffect, useState } from "react";
import { hash } from "starknet";

export function useGetStarknetContractClassHash(payload: any) {
  const [classHash, setClassHash] = useState('')
  useEffect(() => {
    if (payload) {
      try {
        setClassHash(hash.computeContractClassHash(payload))
      } catch (e) {
        //
      }
    }
  }, [payload])

  return classHash
}