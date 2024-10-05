"use client";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect } from "react";
type Props = {};

export default function Profile({}: Props) {
  const { data, status } = useSession();

  useEffect(() => {
    console.log("🚀 ~ Profile ~ data:", data);
    console.log("🚀 ~ Profile ~ status:", status);
  }, [data, status]);

  return (
    <div>
        <p>
      This is the profile page.
        </p>
      <button
      className="border p-3"
        onClick={() => {
          signOut({ callbackUrl: "/login" });
        }}
      >
        logout
      </button>
    </div>
  );
}
