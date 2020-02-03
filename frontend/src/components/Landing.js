import React, { useState } from "react";
import { getProgram, createProgram } from "../apiClient";
import { useHistory } from "react-router-dom";

function Landing() {
    const [programId, setProgramId] = useState("");
    const handleInputChange = e => {
        setProgramId(e.target.value);
    };
    const history = useHistory();
    const onOpenClick = async () => {
        if (programId.length > 0) {
            try {
                await getProgram(programId);
                history.push("/program/" + programId);
            } catch (err) {
                console.log("Error while retrieving program");
            }
        }
    };
    const onNewProgramClick = async () => {
        try {
            const { data } = await createProgram();
            history.push("/program/" + data.data.id);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div id="container">
            <input
                id="input"
                placeholder="Program ID"
                onChange={handleInputChange}
            />
            <button
                className="button"
                onClick={onOpenClick}
                disabled={programId.length === 0}
            >
                Open
            </button>
            <button
                className="button"
                style={{ backgroundColor: "#B1CB3A" }}
                onClick={onNewProgramClick}
            >
                New Program
            </button>
        </div>
    );
}

export default Landing;
