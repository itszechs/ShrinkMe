import { useContext, useEffect } from "react"
import { AuthContext } from "../containers/App"

export default function DashPage() {
    const { isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/";
        }
    }, [isLoggedIn])

    return (
        <div className="dash-page">
        </div>
    )
}