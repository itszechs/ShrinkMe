import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { useContext } from "react";

import "./NavBar.css";
import { AuthContext } from "../containers/App";

export default function NavBar() {
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    }
    return (
        <div className="nav-bar">
            <h1 className="app-name">ShrinkMe</h1>
            <div className="options">
                {isLoggedIn ? (
                    <>
                        <Link to="/dashboard" className="btn btn-primary nav-btn">Dashboard</Link>
                        <Button className="btn btn-primary nav-btn" onClick={logout}>Logout</Button>
                    </>
                ) : (
                    <Link to="/auth" className="btn btn-primary nav-btn">
                        Get started
                    </Link>
                )}
            </div>
        </div>
    )
}