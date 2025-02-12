import React from "react";
import styles from "./formField.module.css";


interface InputType {
    type: 'text' | 'selector'
    id: string,
    name: string,
    value: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

    options?: string[]
}

interface PropsTypeField extends InputType {
    heading: string
}


const FormField: React.FC<PropsTypeField> = (props) => {
    const { type, id, name, value, onChange, options, heading } = props;

    const getInputType = ({ type, id, name, value, onChange, options }: InputType): React.ReactNode => {
        switch (type) {
            case "text": {
                return <input
                    id={id}
                    className={styles.input}
                    type="text"
                    onChange={onChange}
                    name={name}
                    value={value}
                />
            }
            case "selector": {
                return <select className={styles.select} name={name} id={id} value={value} onChange={onChange}>
                    <option value="">--Please choose an option--</option>
                    {options?.map(option => {
                        return (
                            <option key={option} value={option}>{String(option).toUpperCase()}</option>
                        )
                    })}
                </select>
            }
        }
    }

    return (
        <div className={styles.formGroup}>
            <label className={styles.label} htmlFor={id}>{heading}</label>
            {getInputType(props)}
        </div>
    )
}

export default FormField
