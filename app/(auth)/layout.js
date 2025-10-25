'use client'
/**
 * AuthLayout Component
 *
 * A layout component that centers its children both vertically and horizontally
 * on the page. Typically used for authentication-related pages such as sign-in
 * or sign-up forms.
 *
 * @component
 * @example
 * // Usage within a Next.js page
 * <AuthLayout>
 *   <SignIn />
 * </AuthLayout>
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the layout.
 * @returns {JSX.Element} The rendered layout with centered children.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-center pt-40 items-center">{children}</div>
  );
};

export default AuthLayout;
