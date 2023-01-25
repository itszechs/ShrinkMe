import { useState } from 'react';
import { Input, InputGroup, Button } from 'reactstrap';
import copyIcon from ".././images/icon-copy.svg";
import LoadingBar from "./LoadingBar";
import "./HomePage.css";

const api = {
    base: "https://shrinkme.vercel.app",
    links: "/api/v1/links"
}

export default function HomePage() {

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
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "originalUrl": query
            })
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error(res.statusText);
        }).then((response) => {
            setOutput(`${api.base}/${response.message}`);
            setLoading(false);
        }).catch(err => {
            setOutput(err.message);
            setLoading(false);
        });
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="home-page">
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
                    <div className="output-section">
                        <div className="output-container">
                            <span className="output-field">{output}</span>
                        </div>
                        <Button className="btn copy-button" onClick={copyOutput} >
                            <img src={copyIcon} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
