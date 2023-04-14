import { Card, CardText, CardBody, Button } from 'reactstrap';
import './LinkCard.css';

interface Props {
    id: string,
    title: string;
    subtitle: string;
    onDelete: (linkId: string) => void;
}

export default function LinkCard(props: Props) {
    return (
        <Card className="link-card">
            <CardBody>
                <div className="d-flex align-items-center">
                    <div className="text-truncate">
                        <CardText tag="h5" className="text-truncate">{props.title}</CardText>
                        <CardText ctag="h6" className="mb-2 text-truncate shorten-link">
                            {props.subtitle}
                            <i className="bi bi-box-arrow-up-right" style={{ marginLeft: "8px" }}></i>
                        </CardText>

                    </div>
                    <div className="ms-auto"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "center",
                        }}>
                        <Button color="success" className="btn-icon btn-green" >
                            <i className="bi bi-pencil-fill"></i>
                        </Button>
                        <Button color="danger"
                            className="btn-icon btn-red mt-1"
                            onClick={() => {
                                props.onDelete(props.id)
                            }}>
                            <i className="bi bi-trash-fill"></i>
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
