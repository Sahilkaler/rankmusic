"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, Disc3, User, Mail, Lock, AtSign, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const passwordStrength = () => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getStrengthColor = () => {
    const strength = passwordStrength()
    if (strength <= 1) return "bg-red-500"
    if (strength <= 2) return "bg-yellow-500"
    if (strength <= 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    const strength = passwordStrength()
    if (strength <= 1) return "Weak"
    if (strength <= 2) return "Fair"
    if (strength <= 3) return "Good"
    return "Strong"
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create account")
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but sign in failed. Please try signing in.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2 && username.trim().length >= 3
    return true
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-bg.png')" }}
      />
      
      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4 shadow-lg shadow-green-500/25">
            <Disc3 className="w-8 h-8 text-black animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join the Community</h1>
          <p className="text-gray-400">Create your account and start rating</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-green-500' : 'bg-white/20'}`} />
          <div className={`w-8 h-0.5 transition-all ${step >= 2 ? 'bg-green-500' : 'bg-white/20'}`} />
          <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-green-500' : 'bg-white/20'}`} />
        </div>

        {/* Signup Card - Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSignUp} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Step 1: Name and Username */}
                <div className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                    />
                  </div>

                  {/* Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <AtSign className="w-4 h-4" />
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                    />
                    <p className="text-xs text-gray-500">Only lowercase letters, numbers, and underscores</p>
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceed()}
                  className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:hover:scale-100" 
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                {/* Step 2: Email and Password */}
                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 rounded-xl pr-12 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                i <= passwordStrength() ? getStrengthColor() : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          passwordStrength() <= 1 ? 'text-red-400' :
                          passwordStrength() <= 2 ? 'text-yellow-400' :
                          passwordStrength() <= 3 ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          Password strength: {getStrengthText()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || password.length < 6}
                    className="flex-[2] h-12 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:hover:scale-100" 
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-500">Already a member?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link href="/auth/signin">
            <Button 
              variant="outline" 
              className="w-full h-12 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all"
            >
              Sign In Instead
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm mb-4">
            Join thousands of music lovers rating albums
          </p>
          
          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-6 text-gray-400 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Spotify synced</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Social features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
