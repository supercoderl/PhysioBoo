export interface FluidBalance {
  time: string;
  intake: {
    oral: number;
    iv: number;
    total: number;
  };
  output: {
    urine: number;
    drain: number;
    total: number;
  };
  balance: number;
}