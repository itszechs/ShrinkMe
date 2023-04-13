import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import "./AuthPage.css";
import { api } from "../utils/constants";

export interface AlertModalProps {
    title: string,
    message: string
}

enum FormState {
    LOGIN,
    SIGNUP
}

export default function AuthPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [loginShowPassword, setLoginShowPassword] = useState<boolean>(false);
    const [signupShowPassword, setSignupShowPassword] = useState<boolean>(false);
    const [formState, setFormState] = useState(FormState.SIGNUP);
    const [marginLeft, setMarginLeft] = useState<string>("0%");
    const [signupHeight, setSignupHeight] = useState<string>("0%");
    const [loginChecked, setLoginChecked] = useState<boolean>(true);
    const [signupChecked, setSignupChecked] = useState<boolean>(false);
    const [alertModal, setAlertModal] = useState<boolean>(false);

    const [alertModalProps, setAlertModalProps] = useState<AlertModalProps>({
        title: "",
        message: ""
    });

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
        if (loading) return;
        setFormState(FormState.SIGNUP);
    };

    const handleLoginClick = () => {
        if (loading) return;
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

    const toggle = () => {
        setAlertModal(!alertModal);
    };

    const validateUsernamePasword = (username: string, password: string) => {
        if (username.length < 5 || username.includes(" ")) {
            setAlertModalProps({
                title: "Invalid form",
                message: "Username should be at least 5 characters long and should not contain empty spaces"
            })
            setAlertModal(true);
            return false;
        }

        if (password.length < 8 || password.includes(" ")) {
            setAlertModalProps({
                title: "Invalid form",
                message: "Password should be at least 8 characters long and should not contain empty spaces"
            })
            setAlertModal(true);
            return false;
        }
        return true;
    };


    const signup = () => {
        if (loading) return;

        const firstName = (document.getElementById("firstName") as HTMLInputElement).value;
        const lastName = (document.getElementById("lastName") as HTMLInputElement).value;
        const username = (document.getElementById("signupUsername") as HTMLInputElement).value;
        const password = (document.getElementById("signupPassword") as HTMLInputElement).value;
        const confirmPassword = (document.getElementById("signupConfirmPassword") as HTMLInputElement).value;

        if (
            firstName.length === 0
            || lastName.length === 0
            || username.length === 0
            || password.length === 0
            || confirmPassword.length === 0
        ) {
            setAlertModalProps({
                title: "Invalid form",
                message: "Please fill in all fields"
            })
            setAlertModal(true);
            return;
        }

        if (firstName.length < 2 || lastName.length < 2) {
            setAlertModalProps({
                title: "Invalid form",
                message: "First and last name should be at least 2 characters long"
            })
            setAlertModal(true);
            return;
        }

        if (!validateUsernamePasword(username, password)) {
            return;
        }

        if (password !== confirmPassword) {
            setAlertModalProps({
                title: "Invalid form",
                message: "Passwords do not match"
            })
            setAlertModal(true);
            return;
        }

        setLoading(true);

        fetch(api.buildUrl(api.signup), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password
            })
        }).then(res => {
            if (res.status === 201) {
                return res.json();
            }
            return Promise.reject(res);
        }).then((response) => {
            let token = response.message;
            localStorage.setItem("token", token);
            window.location.href = "/";
            setLoading(false);
        }).catch(err => {
            err.json().then((error: any) => {
                setAlertModalProps({
                    title: "Failed to signup",
                    message: error.message
                })
                setAlertModal(true);
            });
            setLoading(false);
        });

    }

    const login = () => {
        if (loading) return;

        const username = (document.getElementById("loginUser") as HTMLInputElement).value;
        const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

        if (username.length === 0 || password.length === 0) {
            setAlertModalProps({
                title: "Invalid form",
                message: "Please fill in all fields"
            })
            setAlertModal(true);
            return;
        }

        if (!validateUsernamePasword(username, password)) {
            return;
        }

        setLoading(true);

        fetch(api.buildUrl(api.login), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(res);
        }).then((response) => {
            let token = response.message;
            localStorage.setItem("token", token);
            window.location.href = "/";
            setLoading(false);
        }).catch(err => {
            err.json().then((error: any) => {
                setAlertModalProps({
                    title: "Failed to login",
                    message: error.message
                })
                setAlertModal(true);
            });
            setLoading(false);
        });
    }

    return (
        <div className="auth-page">
            <Modal isOpen={alertModal} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>{alertModalProps.title}</ModalHeader>
                <ModalBody>{alertModalProps.message}</ModalBody>
                <ModalFooter>
                    <div className="field btn alert-btn-container " onClick={toggle} >
                        <input className="alert-btn" type="submit" value="Close" />
                    </div>
                </ModalFooter>
            </Modal>
            <div className="wrapper">
                <div className="form-container">
                    <div className="slide-controls">
                        <input type="radio" name="slide" id="login" checked={loginChecked} disabled={loading} />
                        <input type="radio" name="slide" id="signup" checked={signupChecked} disabled={loading} />
                        <label className="slide login" onClick={handleLoginClick}>Login</label>
                        <label className="slide signup" onClick={handleSignupClick}>Signup</label>
                        <div className="slider-tab"></div>
                    </div>
                    <div className="form-inner">
                        <div className="form login" style={{ marginLeft: marginLeft }}>
                            <div className="field">
                                <input id="loginUser" type="text" placeholder="Username" disabled={loading} />
                            </div>
                            <div className="field">
                                <input id="loginPassword" type={loginShowPassword ? "text" : "password"}
                                    placeholder="Password" disabled={loading} />
                            </div>
                            <label className="show-pass">
                                <input className="form-check-input" type="checkbox" onClick={handleShowPassword} />
                                <span className="checkbox-label">Show password</span>
                            </label>
                            <div className="field btn horizontal" onClick={login}>
                                {loading &&
                                    <Spinner
                                        className="loading-spinner"
                                        size="lg">Submitting...</Spinner>
                                }
                                <input type="submit" value="Login" />
                            </div>
                        </div>
                        <div className="form signup" style={{ height: signupHeight }}>
                            <div className="field horizontal">
                                <input id="firstName" type="text" placeholder="First name" style={{
                                    marginRight: "5px"
                                }} disabled={loading} />
                                <input id="lastName" type="text" placeholder="Last name" style={{
                                    marginLeft: "5px"
                                }} disabled={loading} />
                            </div>
                            <div className="field">
                                <input id="signupUsername" type="text" placeholder="Username" disabled={loading} />
                            </div>
                            <div className="field">
                                <input id="signupPassword" type={signupShowPassword ? "text" : "password"}
                                    placeholder="Password" disabled={loading} />
                            </div>
                            <div className="field">
                                <input id="signupConfirmPassword" type={signupShowPassword ? "text" : "password"}
                                    placeholder="Confirm password" disabled={loading} />
                            </div>
                            <label className="show-pass">
                                <input className="form-check-input" type="checkbox" onClick={handleShowPassword} />
                                <span className="checkbox-label">Show password</span>
                            </label>
                            <div className="field btn horizontal" onClick={signup}>
                                {loading &&
                                    <Spinner
                                        className="loading-spinner"
                                        size="lg">Submitting...</Spinner>
                                }
                                <input type="submit" value="Signup" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}