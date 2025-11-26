export interface DataPageDto<T> {
  readonly values: T[]; // page of values returned by the database
  readonly hasMorePages: boolean; // Indicates whether there are more pages of data available to be retrieved
}
