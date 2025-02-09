import React from "react";
import styles from "./iframe.module.css";
interface IframeProps {
    fields: {
        id: string;
        label: string;
        placeholder: string;
        type: string;
        width: string;
    }[];
}


const generateIframeCss = () => {
    return `
        <style>
            header{text-align: center;margin:20px auto; border-bottom: 1px solid #ccc; padding: 20px 0}
            footer{text-align: center;margin:0px auto; border-top: 1px solid #ccc;padding: 20px 0}
            main{padding: 20px 0}
            .form-empty{text-align: center;margin:20px auto;}
            body { font-family: Arial, sans-serif; padding: 16px; }
            .field { margin-bottom: 10px; width: 100%; }
            label { display: block; font-weight: bold; margin-bottom: 4px; }
            input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; resize: none; }
            
            .form { max-width: 100%; margin: 0 auto; display: flex; flex-wrap: wrap; column-gap: 12px; row-gap: 12px; }
            .field-full { width: 100%; }
            .field-half { width:calc(100% / 2 - 12px * 1 / 2); }
            .field-third { width:calc(100% / 3  - 12px * 2 / 3); }
            .field-quarter { width:calc(100% / 4 - 12px * 3 / 4); }
            button{width: 25%; padding: 10px 25px; border:none; background:#ccc; color: #fff;border-radius: 4px}
        </style>
    `
}

const IframePreview: React.FC<IframeProps> = ({ fields }) => {
    const generateHtml = () => {
        return `
            <html>
            <head>
                ${generateIframeCss()}
            </head>
            <body>
                <header>Store Header</header>
                <main>
                    <div class="form">
                        ${fields.length
                            ? 
                                fields.map(
                                    (field) => `
                                        <div class="field field-${String(field.width).toLowerCase()}">          
                                            <label for="${field.id}">${field.label}</label>
                                            ${field.type != "comment"
                                                ? `<input type="text" id="${field.id}" placeholder="${field.placeholder}" />`
                                                : `<textarea rows="8" id="${field.id}" placeholder="${field.placeholder}"></textarea>`
                                            }

                                            
                                        </div>
                                    `
                                    )
                                .join("")
                            : `<div class="form-empty">Your form is empty</div>`
                        }
                        ${fields.length ? "<button>Submit</button>": ""}  
                    </div>
                </main>
                <footer>Store Footer</footer>
            </body>
            </html>
        `;
    };

    const [html, setHtml] = React.useState(generateHtml());

    React.useEffect(() => {
        setHtml(generateHtml());
    }, [fields]);

    return (
        <iframe className={styles.iframe} srcDoc={html} />
    );
};


export default IframePreview;