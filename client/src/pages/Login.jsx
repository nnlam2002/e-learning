import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
  useForgotPasswordMutation,
} from "@/features/api/authApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState({ email: "", code: "", pass:''});
  const [isEmailSent, setIsEmailSent] = useState(false); // Trạng thái gửi email thành công
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState("login");
  const [searchParams] = useSearchParams();
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false); // Quản lý trạng thái mã hợp lệ
  // const [newPassword, setNewPassword] = useState("");    // Quản lý mật khẩu mới

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup" || tab === "login") {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword((prev) => !prev);
  };
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    forgotPassword
  ] = useForgotPasswordMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else if(type === "login") {
      setLoginInput({ ...loginInput, [name]: value });
    }else{
      setForgotEmail((prevState) => {
        const updatedState = { ...prevState, [name]: value };
  
        // Kiểm tra mã code đã đủ 6 ký tự hay chưa
        if (name === "code") {
          setIsCodeComplete(value.length === 6); // Cập nhật trạng thái nút Submit
        }
  
        return updatedState;
      });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };
  const handleForgotPassword = async () => {
    if (!forgotEmail.email) {
      toast.error("Please enter your email.");
      return;
    }
    // if (!forgotEmail.code) {
    //   return;
    // }
    // Add forgot password logic here
    try {
      // Thực hiện gửi email
      // const response = await forgotPassword({ email: forgotEmail.email, code: forgotEmail.code });
      const response = await forgotPassword(forgotEmail);
      // toast.success("A reset code has been sent to your email.");
      if (response.data.message === "Password has been reset successfully.") {
            setForgotPasswordDialogOpen(false);
      }
      if (response?.data?.success) {
        toast.success(response.data.message);
        setIsCodeValid(true); // Cho phép nhập mật khẩu mới
    } else {
        toast.error(response?.data?.message || "Incorrect code.");
        setIsCodeValid(false); // Không hợp lệ
    }
      setIsEmailSent(true); // Cập nhật trạng thái gửi email thành công
    } catch (error) {
      toast.error("Failed to send reset code. Please try again.");
    }

  };
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
      setSignupInput({ name: "", email: "", password: "" });
      setLoginInput({ email: "", password: "" });
      setCurrentTab("login");
    }

    if (registerError) {
      const errorMessage =
        registerError?.data?.message || "Signup Failed";
      toast.error(errorMessage);
    }

    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/");
    }
    // if (forgotPasswordIsSuccess && forgotPasswordData) {
    //   toast.success(forgotPasswordData.message || "Forget password successful.");
    //   navigate("/");
    // }
    // if (forgotPasswordError) {
    //   const errorMessage =
    //   forgotPasswordError?.data?.message || "Login Failed";
    //   toast.error(errorMessage);
    // }
    if (loginError) {
      const errorMessage =
        loginError?.data?.message || "Login Failed";
      toast.error(errorMessage);
    }
  }, [
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    loginError,
    registerError,
  ]);


  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. patel"
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. patel@gmail.com"
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Eg. xyz"
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login your password here. After signup, you'll be logged in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. patel@gmail.com"
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Password</Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="Eg. xyz"
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleLoginPasswordVisibility}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
              <button
              className="text-sm text-blue-500 underline"
              onClick={() => setForgotPasswordDialogOpen(true)}
            >
              Forgot Password?
            </button>
            </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      {forgotPasswordDialogOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-md w-[400px]">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

      {/* Input Email */}
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={forgotEmail.email}
        onChange={(e) => changeInputHandler(e, "forgot")}
        disabled={isEmailSent} // Disable khi email đã được gửi
        required
      />

      {/* Input Code */}
      {isEmailSent && (
        <div className="mt-4">
          <Input
            type="text"
            name="code"
            placeholder="Enter 6-digit code"
            value={forgotEmail.code}
            onChange={(e) => changeInputHandler(e, "forgot")}
            maxLength={6}
            required
          />
        </div>
      )}

      {/* Input New Password (chỉ hiển thị khi mã hợp lệ) */}
      {isCodeValid && (
        <div className="mt-4">
          <Input
            type="password"
            name="pass"
            placeholder="Enter new password"
            value={forgotEmail.pass}
            onChange={(e) => changeInputHandler(e, "forgot")}
            required
          />
        </div>
      )}

      <div className="flex justify-end mt-4 space-x-2">
        <Button onClick={() => setForgotPasswordDialogOpen(false)} variant="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleForgotPassword} 
          disabled={isEmailSent && !forgotEmail.code}
        >
          {isCodeValid ? "Submit" : isEmailSent ? "Verify Code" : "Send"}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};
export default Login;
