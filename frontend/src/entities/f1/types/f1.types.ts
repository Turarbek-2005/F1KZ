export interface Driver {
  id: number;
  driverId: string;
  imgUrl: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  teamId: string;
  teamImgUrl: string;
  bolidImgUrl: string;
  createdAt: string;
  updatedAt: string;
}
