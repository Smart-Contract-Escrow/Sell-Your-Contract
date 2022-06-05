import { createContext, useContext } from "react";

export const LoadingContext = createContext(false) as any;
export const EventsContext = createContext({
  transContract: false,
  readyForBuyer: false,
  paymentSent: false
}) as any;

export function useLoading(): any {
  return useContext(LoadingContext);
}
export function useEvents(): any {
  return useContext(EventsContext);
}
