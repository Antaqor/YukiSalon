"use client";
import { useState, useEffect } from "react";
import Router from "next/router";
import LoadingOverlay from "./LoadingOverlay";

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shouldShow = (url: string) =>
      url === "/" || url.startsWith("/users") || url.startsWith("/profile");
    const start = (url: string) => {
      if (shouldShow(url)) setLoading(true);
    };
    const end = () => setLoading(false);
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  if (!loading) return null;
  return <LoadingOverlay />;
}
