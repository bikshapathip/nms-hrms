export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/salary-templates/:path*",
    "/employees/:path*",
    "/attendance/:path*",
    "/payslips/:path*",
    "/users/:path*",
  ],
};
