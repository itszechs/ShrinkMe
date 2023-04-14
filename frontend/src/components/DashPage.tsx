import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../containers/App"
import { Fade, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
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

        toast.info(
            "Click on card to copy link to clipboard!", {
            position: "top-right",
            autoClose: 3000,
        });

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

    const openLinkEditor = (id: string, original: string, shortenId: string) => {
        setEditorId(id);
        setEditorOriginal(original);
        setEditorShorten(shortenId);
        setModal(true);
    }

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);
    const [editorId, setEditorId] = useState<string>("");
    const [editorOriginal, setEditorOriginal] = useState<string>("");
    const [editorShorten, setEditorShorten] = useState<string>("");

    useEffect(() => {
        // clear inputs when dismissed
        if (!modal) {
            setEditorId("");
            setEditorOriginal("");
            setEditorShorten("");
        }
    }, [modal]);

    const updateLink = () => {
        const id = toast.loading("Updating link...");
        const linkId = editorId;
        const linkOriginal = editorOriginal;
        const regex = /[A-Z]/g;
        if (regex.test(editorShorten)) {
            toast.info("Link converted to lowercase!")
        }
        const newShorten = editorShorten.toLowerCase();

        setModal(false);
        fetch(`${api.buildUrl(api.links)}/${linkId}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                originalUrl: linkOriginal,
                shortenUrl: newShorten
            })
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(res);
        }).then((_) => {
            //update the link in the state
            let _links = links.map(link => {
                if (link._id === linkId) {
                    return {
                        "_id": linkId,
                        "shortenUrl": newShorten,
                        "originalUrl": linkOriginal
                    }
                }
                return link;
            });
            setLinks(_links);
            toast.update(id,
                {
                    render: "Link updated successfully!",
                    type: "success",
                    isLoading: false,
                }
            );
        }).catch(err => {
            try {
                err.json().then((res: any) => {
                    const message = res.message;
                    toast.update(id,
                        {
                            render: message,
                            type: "error",
                            isLoading: false,
                        }
                    );
                });
            } catch (e) {
                toast.update(id,
                    {
                        render: "Unable to update the link!",
                        type: "error",
                        isLoading: false,
                    }
                );
            }
        }).finally(() => {
            setTimeout(() => {
                toast.dismiss(id);
            }, 5000);
        });
    }

    const copyLink = (shortenId: string) => {
        let shortenLink = `${api.base}/${shortenId}`;
        navigator.clipboard.writeText(shortenLink);
        toast.info("Copied to clipboard!");
    };

    return (
        <div className="dash-page">
            <ToastContainer
                position="bottom-left"
                newestOnTop
                theme="colored"
            />
            <Modal isOpen={modal} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>Link Editor</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Original link</Label>
                        <Input
                            type="text"
                            value={editorOriginal}
                            onChange={e => setEditorOriginal(e.target.value)}
                            disabled
                            style={{
                                cursor: "not-allowed",
                                borderRadius: "8px"
                            }} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Shorten link</Label>
                        <Input
                            type="text"
                            value={editorShorten}
                            onChange={e => setEditorShorten(e.target.value)}
                            style={{
                                borderRadius: "8px"
                            }} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <div className="field btn horizontal btn-green"
                        onClick={updateLink}
                        style={{
                            borderRadius: "12px"
                        }} >
                        <input className="no-background" type="submit" value="Save" />
                    </div>
                    <div className="field btn horizontal btn-red"
                        onClick={toggle}
                        style={{
                            borderRadius: "12px"
                        }}>
                        <input className="no-background" type="submit" value="Cancel" />
                    </div>
                </ModalFooter>
            </Modal>
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
                                onCopy={(shortenId) => copyLink(shortenId)}
                                onShorten={(shortenId) => openShortenLink(shortenId)}
                                onEdit={(id, original, shortenId) => {
                                    openLinkEditor(id, original, shortenId);
                                }}
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