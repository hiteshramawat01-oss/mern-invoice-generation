import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Upload, Store, CreditCard, UserPlus, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "",
    shopName: "", shopAddress: "", shopPhone: "", shopEmail: "",
    paymentUPI: "", paymentInfo: "", brandColor: "#3b82f6", logo: "", paymentQRCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleFileUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateField(field, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = "Valid email required";
      if (formData.password.length < 6) errs.password = "Min 6 characters";
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords don't match";
    }
    if (s === 2) {
      if (!formData.shopName.trim()) errs.shopName = "Shop name required";
      if (!formData.shopPhone.trim()) errs.shopPhone = "Phone required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    if (step < totalSteps) { setStep(step + 1); return; }
    setLoading(true);
    setError("");
    try {
      await signup(formData.email, formData.password, {
        shopName: formData.shopName, shopAddress: formData.shopAddress,
        shopPhone: formData.shopPhone, shopEmail: formData.shopEmail,
        paymentUPI: formData.paymentUPI, paymentInfo: formData.paymentInfo,
        paymentQRCode: formData.paymentQRCode, brandColor: formData.brandColor, logo: formData.logo,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 md:p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Create Your Account</h2>
              <p className="text-gray-600">Sign up to start creating invoices</p>
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="your@email.com" className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => updateField("password", e.target.value)} placeholder="At least 6 characters" className={`pr-10 ${errors.password ? "border-red-500" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} value={formData.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)} placeholder="Re-enter password" className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Sign In</Link></p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Store className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold">Business Information</h2>
              <p className="text-gray-600">Tell us about your business</p>
            </div>
            <div>
              <Label>Business Name *</Label>
              <Input value={formData.shopName} onChange={e => updateField("shopName", e.target.value)} placeholder="My Awesome Store" className={errors.shopName ? "border-red-500" : ""} />
              {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName}</p>}
            </div>
            <div>
              <Label>Business Email</Label>
              <Input type="email" value={formData.shopEmail} onChange={e => updateField("shopEmail", e.target.value)} placeholder="shop@example.com" />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input type="tel" value={formData.shopPhone} onChange={e => updateField("shopPhone", e.target.value)} placeholder="+91 98765 43210" className={errors.shopPhone ? "border-red-500" : ""} />
              {errors.shopPhone && <p className="text-red-500 text-sm mt-1">{errors.shopPhone}</p>}
            </div>
            <div>
              <Label>Business Address</Label>
              <Input value={formData.shopAddress} onChange={e => updateField("shopAddress", e.target.value)} placeholder="123 Main St, City, State" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Payment Information</h2>
              <p className="text-gray-600">Set up how customers pay you</p>
            </div>
            <div>
              <Label>UPI ID</Label>
              <Input value={formData.paymentUPI} onChange={e => updateField("paymentUPI", e.target.value)} placeholder="yourname@upi" />
              <p className="text-xs text-gray-500 mt-1">We'll auto-generate a QR code on invoices</p>
            </div>
            <div>
              <Label>Upload Payment QR Code (Optional)</Label>
              {formData.paymentQRCode ? (
                <div className="space-y-2 mt-2">
                  <img src={formData.paymentQRCode} alt="QR" className="max-h-40 mx-auto border rounded" />
                  <Button variant="outline" className="w-full" onClick={() => updateField("paymentQRCode", "")}>Remove</Button>
                </div>
              ) : (
                <label className="flex flex-col items-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 mt-2">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload QR code image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload("paymentQRCode")} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <Label>Additional Payment Details</Label>
              <Input value={formData.paymentInfo} onChange={e => updateField("paymentInfo", e.target.value)} placeholder="Bank account, payment terms..." />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold">Brand Your Invoices</h2>
              <p className="text-gray-600">Add logo and brand color (optional)</p>
            </div>
            <div>
              <Label>Business Logo</Label>
              {formData.logo ? (
                <div className="space-y-2 mt-2">
                  <img src={formData.logo} alt="Logo" className="max-h-32 mx-auto border rounded p-2" />
                  <Button variant="outline" className="w-full" onClick={() => updateField("logo", "")}>Remove</Button>
                </div>
              ) : (
                <label className="flex flex-col items-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-gray-50 mt-2">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload logo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload("logo")} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <Label>Brand Color</Label>
              <div className="flex gap-3 items-center mt-2">
                <input type="color" value={formData.brandColor} onChange={e => updateField("brandColor", e.target.value)} className="h-12 w-20 rounded border cursor-pointer" />
                <Input value={formData.brandColor} onChange={e => updateField("brandColor", e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" disabled={loading}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1" disabled={loading}>
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Creating...</>
              : step === totalSteps ? <><UserPlus className="w-4 h-4 mr-2" />Create Account</>
              : <>Next<ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
