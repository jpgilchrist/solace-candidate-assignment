export type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: Date;
};

export type Pagination = {
  pageIndex: number;
  pageSize: number;
  rowCount: number;
};

export type AdvocateResponse = {
  data: Advocate[];
  pagination: Pagination;
};
