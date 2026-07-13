"use client";

import { useEffect } from "react";
import { fetchMe, hydrateToken } from "@/entities/auth/model/authSlice";
import { useAppDispatch } from "@/shared/lib/hooks";

export function InitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore the persisted token before the first authenticated request, so a
    // page reload re-attaches the session instead of landing on a 401.
    dispatch(hydrateToken());
    dispatch(fetchMe());
  }, [dispatch]);

  return null;
}
