import { useContext, useState } from 'react';
import { Input, InputGroup, Button, Fade } from 'reactstrap';
import copyIcon from ".././images/icon-copy.svg";
import LoadingBar from "./LoadingBar";
import { api } from "../utils/constants";
import "./HomePage.css";
import { AuthContext } from '../containers/App';


export default function HomePage() {
    const { isLoggedIn } = useContext(AuthContext);

    const [query, setQuery] = useState<string>("");
    const [output, setOutput] = useState<string>("Your shortened link will appear here");
    const [loading, setLoading] = useState<boolean>(false);

    const generateLink = () => {
        if (query === "") {
            setOutput("Please enter a link");
            return;
        }
        setLoading(true);
        fetch(`${api.base}${api.links}`, {
            method: "POST",
            headers: isLoggedIn ? {
                "Content-type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            } : {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "originalUrl": query
            })
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(res);
        }).then((response) => {
            setOutput(`${api.base}/${response.message}`);
            setLoading(false);
        }).catch(err => {
            err.json().then((error: any) => {
                setOutput(error.message);
            });
            setLoading(false);
        });
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="home-page">
            <div className="heading">
                <span className="tagline">ShrinkMe - Shorten your links, expand your reach!</span>
                <span className="tagline sub">Shorten, simplify and track your links with ease!</span>
            </div>
            <InputGroup className="input-group">
                <Input
                    className="form-control input-field"
                    placeholder="Shorten your link"
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            generateLink()
                        }
                    }}
                    onChange={e => setQuery(e.target.value)}
                    value={query} />
                <Button className="btn shorten-button" onClick={generateLink}>
                    Shorten
                </Button>
            </InputGroup>
            <div className="output-section">
                {(loading) ? (<LoadingBar />) : (
                    <Fade tag="div">
                        <div className="output-section">
                            <div className="output-container">
                                <span className="output-field">{output}</span>
                            </div>
                            <Button className="btn copy-button" onClick={copyOutput} >
                                <img src={copyIcon} alt="" />
                            </Button>
                        </div>
                    </Fade>
                )}
            </div>
        </div>
    );
}
