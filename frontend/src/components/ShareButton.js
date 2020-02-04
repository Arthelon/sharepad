import React from "react";
import PropTypes from "prop-types";

const copyToClipboard = text => {
    // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    const selected =
        document.getSelection().rangeCount > 0
            ? document.getSelection().getRangeAt(0)
            : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
    }
};

function ShareButton({ programId }) {
    const handleClick = () => {
        copyToClipboard(
            process.env.REACT_APP_SPA_HOST + "/program/" + programId
        );
    };

    return (
        <button className="share-button" onClick={handleClick}>
            <svg
                fill="#fff"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
            >
                <path d="M 18 2 A 3 3 0 0 0 15 5 A 3 3 0 0 0 15.054688 5.5605469 L 7.9394531 9.7109375 A 3 3 0 0 0 6 9 A 3 3 0 0 0 3 12 A 3 3 0 0 0 6 15 A 3 3 0 0 0 7.9355469 14.287109 L 15.054688 18.439453 A 3 3 0 0 0 15 19 A 3 3 0 0 0 18 22 A 3 3 0 0 0 21 19 A 3 3 0 0 0 18 16 A 3 3 0 0 0 16.0625 16.712891 L 8.9453125 12.560547 A 3 3 0 0 0 9 12 A 3 3 0 0 0 8.9453125 11.439453 L 16.060547 7.2890625 A 3 3 0 0 0 18 8 A 3 3 0 0 0 21 5 A 3 3 0 0 0 18 2 z" />
            </svg>
        </button>
    );
}
ShareButton.propTypes = {
    programId: PropTypes.string.isRequired
};

export default ShareButton;
