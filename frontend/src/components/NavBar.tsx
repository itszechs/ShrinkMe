import { Link } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
    return (
        <div className="nav-bar">
            <h1 className="app-name">ShrinkMe</h1>
            <div className="options">
                <Link
                    to="/auth"
                    className="btn btn-primary nav-btn"
                >Get started</Link>
            </div>
        </div>
    )
}