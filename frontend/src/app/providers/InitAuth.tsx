"use client";

import { useEffect } from "react";
import { fetchMe } from "@/entities/auth/model/authSlice";
import { useAppDispatch } from "@/shared/lib/hooks";

export function InitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return null;
}
