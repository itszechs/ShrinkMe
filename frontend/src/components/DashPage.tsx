import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../containers/App"
import { Fade, Spinner } from "reactstrap";
import { api } from "../utils/constants";
import LinkCard from "./LinkCard";
import "./DashPage.css"

interface UserLink {
    id: string,
    shortenUrl: string,
    originalUrl: string,
}

export default function DashPage() {
    const { isLoggedIn } = useContext(AuthContext);
    const [links, setLinks] = useState<UserLink[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/";
        }

        setLoading(true);

        fetch(api.buildUrl(api.links), {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(res);
        }).then((response) => {
            let _links: UserLink[] = [];
            for (let i = 0; i < response.length; i++) {
                _links.push(response[i]);
            }
            setLinks(_links);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            err.json().then((error: any) => {
                console.log(error.message);
                // setOutput(error.message);
            });
            setLoading(false);
        });

    }, [isLoggedIn]);

    return (
        <div className="dash-page">
            <div className="heading dash-heading">
                <span className="tagline">Your Dashboard: Manage Your Shortened URLs</span>
                <span className="tagline sub">Edit or delete your links anytime from your dashboard</span>
            </div>
            {loading ? (
                <Spinner style={{ marginTop: "20px" }} />
            ) : (
                <Fade tag="div">
                    <div className="links-grid">
                        {links.map((link, index) => (
                            <LinkCard key={index}
                                title={link.originalUrl}
                                subtitle={link.shortenUrl}
                            />
                        ))}
                    </div>
                </Fade>
            )}
        </div>
    )
}