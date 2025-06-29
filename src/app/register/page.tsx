"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../lib/config";

/** Helper validations **/
const isValidPhoneNumber = (phone: string) => {
    const regex = /^\+?\d{8,15}$/;
    return regex.test(phone);
};

const isValidPassword = (password: string) => {
    return password.length >= 6;
};

// Adjust if you want different min/max sizes:
const MIN_FILE_SIZE = 10 * 1024;        // 10KB
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB

export default function RegisterMultiStepPage() {
    const router = useRouter();

    // ---------- STEP CONTROL ----------
    const [step, setStep] = useState(1);

    // ---------- STEP 1 FIELDS (NO name) ----------
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [birthYear, setBirthYear] = useState("");

    // ---------- STEP 2 FIELDS ----------
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [location, setLocation] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    // ---------- GENERAL UI STATES ----------
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ---------- FIELD-SPECIFIC ERRORS ----------
    const [fieldErrors, setFieldErrors] = useState<{
        [key: string]: string;
    }>({
        username: "",
        phoneNumber: "",
        birthMonth: "",
        birthDay: "",
        birthYear: "",
        password: "",
        gender: "",
        location: "",
        profilePicture: "",
    });

    // Replace with your actual server endpoint

    // ------------------------------------------------------------------
    // STEP 1: Validate Basic Fields and proceed to next step
    // ------------------------------------------------------------------
    const handleNext = () => {
        setError("");
        setSuccess("");
        setFieldErrors({
            username: "",
            phoneNumber: "",
            birthMonth: "",
            birthDay: "",
            birthYear: "",
            password: "",
            gender: "",
            location: "",
            profilePicture: "",
        });

        const errors: { [key: string]: string } = {};

        if (!username.trim()) {
            errors.username = "Хэрэглэгчийн нэр оруулна уу.";
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            errors.phoneNumber = "Утасны дугаар буруу байна.";
        }
        if (!birthMonth) {
            errors.birthMonth = "Төрсөн сарыг сонгоно уу.";
        }
        if (!birthDay) {
            errors.birthDay = "Төрсөн өдрийг сонгоно уу.";
        }
        if (!birthYear) {
            errors.birthYear = "Төрсөн жилийг сонгоно уу.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        // Proceed to Step 2
        setStep(2);
    };

    // ------------------------------------------------------------------
    // STEP 2: Validate Additional Fields & Final Submit
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({
            username: "",
            phoneNumber: "",
            birthMonth: "",
            birthDay: "",
            birthYear: "",
            password: "",
            gender: "",
            location: "",
            profilePicture: "",
        });

        const errors: { [key: string]: string } = {};

        if (!isValidPassword(password)) {
            errors.password = "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.";
        }
        if (!gender.trim()) {
            errors.gender = "Хүйсээ сонгоно уу.";
        }
        if (!location.trim()) {
            errors.location = "Байршлаа оруулна уу.";
        }
        if (!profilePicture) {
            errors.profilePicture = "Профайл зураг оруулна уу.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        // Construct final form data
        try {
            const formData = new FormData();

            // Step 1 data
            formData.append("username", username);
            formData.append("phoneNumber", phoneNumber);
            formData.append(
                "birthday",
                JSON.stringify({
                    year: birthYear,
                    month: birthMonth,
                    day: birthDay,
                })
            );

            // Step 2 data
            formData.append("password", password);
            formData.append("gender", gender);
            formData.append("location", location);
            if (profilePicture) {
                formData.append("profilePicture", profilePicture);
            }

            const res = await axios.post(`${BASE_URL}/api/auth/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 201) {
                setSuccess("Ажилттай бүртгэл үүсгэлээ");
                // Clear all fields
                setStep(1);
                setUsername("");
                setPhoneNumber("");
                setBirthMonth("");
                setBirthDay("");
                setBirthYear("");
                setPassword("");
                setGender("");
                setLocation("");
                setProfilePicture(null);
                // Redirect new users to login page
                router.push("/login");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Бүртгэлийн алдаа гарлаа");
        }
    };

    // ------------------------------------------------------------------
    // CLIENT-SIDE FILE CHECK: ensure size (10KB–5MB) + image type
    // ------------------------------------------------------------------
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        setFieldErrors((prev) => ({ ...prev, profilePicture: "" }));

        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];

        // Check size
        if (file.size < MIN_FILE_SIZE || file.size > MAX_FILE_SIZE) {
            setFieldErrors((prev) => ({
                ...prev,
                profilePicture: `Зураг нь хамгийн багадаа 10KB, ихдээ 5MB байх ёстой (current: ${(file.size / 1024).toFixed(
                    1
                )} KB).`,
            }));
            return;
        }

        // Check MIME type
        if (!file.type.startsWith("image/")) {
            setFieldErrors((prev) => ({
                ...prev,
                profilePicture: "Зөвхөн зураг файл оруулах боломжтой.",
            }));
            return;
        }

        // If everything is good, store file
        setProfilePicture(file);
    };

    // ---------- Utility: conditional className for inputs/selects ----------
    const getInputClass = (fieldName: string) => {
        return `w-full border rounded-lg px-4 py-3 text-white bg-black placeholder-gray-500 focus:outline-none focus:ring-2 ${
            fieldErrors[fieldName]
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#30c9e8]"
        }`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#171717] text-black dark:text-white px-4 py-8">
            <motion.div
                whileHover={{ opacity: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="w-full max-w-md space-y-6 bg-white text-black dark:bg-[#1B1B1B] dark:text-white p-8 rounded-xl shadow-lg border border-black/10"
            >

                {step === 1 && (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#30c9e8]">Create your account</h1>

                        {/* USERNAME */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">Username</label>
                            <input
                                type="text"
                                className={getInputClass("username")}
                                placeholder="mycoolusername"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {fieldErrors.username && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
                            )}
                        </div>

                        {/* PHONE NUMBER */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">Phone number</label>
                            <input
                                type="text"
                                className={getInputClass("phoneNumber")}
                                placeholder="94641031"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            {fieldErrors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>
                            )}
                        </div>

                        {/* DATE OF BIRTH */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">Date of birth</label>
                            <p className="text-xs text-gray-500 mb-2">
                                This will not be shown publicly. Confirm your own age.
                            </p>
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <select
                                        className={`${getInputClass("birthMonth")} appearance-none pr-8`}
                                        value={birthMonth}
                                        onChange={(e) => setBirthMonth(e.target.value)}
                                    >
                                        <option value="">Month</option>
                                        {[
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December",
                                        ].map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                    <svg
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        className={`${getInputClass("birthDay")} appearance-none pr-8`}
                                        value={birthDay}
                                        onChange={(e) => setBirthDay(e.target.value)}
                                    >
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                    <svg
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        className={`${getInputClass("birthYear")} appearance-none pr-8`}
                                        value={birthYear}
                                        onChange={(e) => setBirthYear(e.target.value)}
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 70 }, (_, i) => 2025 - i).map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                    <svg
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {(fieldErrors.birthMonth ||
                                fieldErrors.birthDay ||
                                fieldErrors.birthYear) && (
                                <p className="text-red-500 text-sm mt-1">
                                    {fieldErrors.birthMonth || fieldErrors.birthDay || fieldErrors.birthYear}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-[#30c9e8] text-sm text-center">{error}</p>
                        )}
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full bg-[#30c9e8] text-white font-semibold py-3 rounded-lg hover:bg-[#28b6d3] active:bg-[#239bb3] transition-colors"
                        >
                            Next
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#30c9e8]">Additional Details</h1>

                        {/* LOGIN PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">
                                Login Password
                            </label>
                            <input
                                type="password"
                                className={getInputClass("password")}
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* GENDER */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">Хүйс</label>
                            <select
                                className={getInputClass("gender")}
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Сонгоно уу</option>
                                <option value="male">Эр</option>
                                <option value="female">Эм</option>
                            </select>
                            {fieldErrors.gender && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.gender}</p>
                            )}
                        </div>

                        {/* LOCATION */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">
                                Байршил
                            </label>
                            <input
                                type="text"
                                className={getInputClass("location")}
                                placeholder="Байршил"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            {fieldErrors.location && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>
                            )}
                        </div>

                        {/* PROFILE PICTURE + LOCAL SIZE CHECK */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-1">
                                Профайл зураг
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className={getInputClass("profilePicture")}
                                onChange={handleProfilePictureChange}
                            />
                            {fieldErrors.profilePicture && (
                                <p className="text-red-500 text-xs mt-1">
                                    {fieldErrors.profilePicture}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-[#30c9e8] text-sm text-center mb-2">{error}</p>
                        )}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-200 text-black py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Буцах
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-[#30c9e8] text-white py-3 rounded-lg font-semibold hover:bg-[#28b6d3] active:bg-[#239bb3] transition-colors"
                            >
                                Бүртгүүлэх
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
            <p className="text-center mt-4 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-[#30c9e8] underline hover:text-[#28b6d3]">
                    Login
                </a>
            </p>
        </div>
    );
}
