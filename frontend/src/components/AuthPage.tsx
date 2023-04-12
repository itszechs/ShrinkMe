import { useEffect, useRef, useState } from "react";

import "./AuthPage.css";

enum FormState {
    LOGIN,
    SIGNUP
}

export default function AuthPage() {
    const [loginShowPassword, setLoginShowPassword] = useState<boolean>(false);
    const [signupShowPassword, setSignupShowPassword] = useState<boolean>(false);
    const [formState, setFormState] = useState(FormState.SIGNUP);
    const [marginLeft, setMarginLeft] = useState<string>("0%");
    const [signupHeight, setSignupHeight] = useState<string>("0%");
    const [loginChecked, setLoginChecked] = useState<boolean>(true);
    const [signupChecked, setSignupChecked] = useState<boolean>(false);
    const heightJob = useRef<any | null>(null);

    useEffect(() => {
        if (heightJob.current !== null) {
            clearInterval(heightJob.current);
        }

        if (formState === FormState.LOGIN) {
            setMarginLeft("0%");
            setLoginChecked(true);
            setSignupChecked(false);
            const signupForm = document.getElementsByClassName("form signup")[0];
            let height = signupForm ? signupForm.clientHeight : 0;
            setSignupHeight(`${height}px`);

            const interval = setInterval(() => {
                height -= 10;
                setSignupHeight(`${height}px`);

                if (height <= 0) {
                    clearInterval(interval);
                }
            }, 1);
            heightJob.current = interval;
        } else if (formState === FormState.SIGNUP) {
            const signupForm = document.getElementsByClassName("form signup")[0];
            let height = signupForm ? signupForm.clientHeight : 0;
            let signupHeight = signupForm ? signupForm.clientHeight : 0;

            const interval = setInterval(() => {
                signupHeight += 10;
                height -= 10;

                setSignupHeight(`${signupHeight}px`);

                if (height <= 0) {
                    clearInterval(interval);
                    setSignupHeight("auto");
                }
            }, 1);

            heightJob.current = interval;
            setMarginLeft("-50%");
            setLoginChecked(false);
            setSignupChecked(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);


    const handleSignupClick = () => {
        setFormState(FormState.SIGNUP);
    };

    const handleLoginClick = () => {
        setFormState(FormState.LOGIN);
    };

    const handleShowPassword = () => {
        if (formState === FormState.LOGIN) {
            setLoginShowPassword(!loginShowPassword);
        } else if (formState === FormState.SIGNUP) {
            setSignupShowPassword(!signupShowPassword);
        } else {
            console.log("Invalid form state");
        }
    };

    return (
        <div className="auth-page">
            <div className="wrapper">
                <div className="form-container">
                    <div className="slide-controls">
                        <input type="radio" name="slide" id="login" checked={loginChecked} />
                        <input type="radio" name="slide" id="signup" checked={signupChecked} />
                        <label className="slide login" onClick={handleLoginClick}>Login</label>
                        <label className="slide signup" onClick={handleSignupClick}>Signup</label>
                        <div className="slider-tab"></div>
                    </div>
                    <div className="form-inner">
                        <div className="form login" style={{ marginLeft: marginLeft }}>
                            <div className="field">
                                <input type="text" placeholder="Username" />
                            </div>
                            <div className="field">
                                <input type={loginShowPassword ? "text" : "password"}
                                    placeholder="Password" />
                            </div>
                            <label className="show-pass">
                                <input className="form-check-input" type="checkbox" onClick={handleShowPassword} />
                                <span className="checkbox-label">Show password</span>
                            </label>
                            <div className="field btn">
                                <input type="submit" value="Login" />
                            </div>
                        </div>
                        <div className="form signup" style={{ height: signupHeight }}>
                            <div className="field horizontal">
                                <input type="text" placeholder="First name" style={{
                                    marginRight: "5px"
                                }} />
                                <input type="text" placeholder="Last name" style={{
                                    marginLeft: "5px"
                                }} />
                            </div>
                            <div className="field">
                                <input type="text" placeholder="Username" />
                            </div>
                            <div className="field">
                                <input type={signupShowPassword ? "text" : "password"} placeholder="Password" />
                            </div>
                            <div className="field">
                                <input type={signupShowPassword ? "text" : "password"} placeholder="Confirm password" />
                            </div>
                            <label className="show-pass">
                                <input className="form-check-input" type="checkbox" onClick={handleShowPassword} />
                                <span className="checkbox-label">Show password</span>
                            </label>
                            <div className="field btn">
                                <input type="submit" value="Signup" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}