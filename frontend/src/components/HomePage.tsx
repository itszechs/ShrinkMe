import { Input, InputGroup, Button } from 'reactstrap';
import copyIcon from ".././images/icon-copy.svg";
import "./HomePage.css";

export default function HomePage() {
    return (
        <div className="home-page">
            <InputGroup className="input-group">
                <Input className="form-control input-field" placeholder="Shorten your link" />
                <Button className="btn shorten-button">
                    Shorten
                </Button>
            </InputGroup>
            <div className="output-section">
                <div className="output-container">
                    <span className="output-field">https://shrinkme.vercel.app/google</span>
                </div>
                <Button className="btn copy-button" >
                    <img src={copyIcon} />
                </Button>
            </div>
        </div>
    );
}
