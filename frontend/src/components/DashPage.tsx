import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../containers/App"
import { Fade, Spinner } from "reactstrap";
import { api } from "../utils/constants";
import { ToastContainer, toast } from 'react-toastify';

import LinkCard from "./LinkCard";

import 'react-toastify/dist/ReactToastify.css';
import "./DashPage.css"

interface UserLink {
    _id: string
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
            try {
                if (response.length === 0) {
                    setLoading(false);
                    toast.info("You have no links yet. Create one now!");
                    return
                }

                let _links: UserLink[] = [];
                for (let i = 0; i < response.length; i++) {
                    _links.push(response[i]);
                }
                setLinks(_links);
                setLoading(false);
            } catch (err) {
                throw err;
            }
        }).catch(err => {
            // console.log(err);
            toast.error(err.message);
            setLoading(false);
        });

    }, [isLoggedIn]);

    const deleteLink = (linkId: string) => {
        const id = toast.loading("Deleting link...");
        fetch(`${api.buildUrl(api.links)}/${linkId}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }).then(res => {
            if (res.status === 202) {
                return res.json();
            }
            return Promise.reject(res);
        }).then(() => {
            //delete the link from the state
            let _links = links.filter(link => link._id !== linkId);
            setLinks(_links);
            toast.update(id,
                {
                    render: "Link deleted successfully!",
                    type: "success",
                    isLoading: false,
                }
            );
        }).catch(_ => {
            toast.update(id,
                {
                    render: "Unable to delete the link!",
                    type: "error",
                    isLoading: false,
                }
            );
        }).finally(() => {
            setTimeout(() => {
                toast.dismiss(id);
            }, 5000);
        });

    }

    const openShortenLink = (shortenId: string) => {
        let shortenLink = `${api.base}/${shortenId}`;
        console.log(shortenLink);
        window.open(shortenLink, "_blank");
    };

    return (
        <div className="dash-page">
            <ToastContainer
                position="bottom-left"
                newestOnTop
                theme="colored"
            />
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
                                id={link._id}
                                title={link.originalUrl}
                                subtitle={link.shortenUrl}
                                onShorten={(shortenId) => openShortenLink(shortenId)}
                                onDelete={(id) => {
                                    deleteLink(id);
                                }}
                            />
                        ))}
                    </div>
                </Fade>
            )}
        </div>
    )
}