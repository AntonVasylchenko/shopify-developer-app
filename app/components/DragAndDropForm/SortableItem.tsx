import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./sortableItem.module.css"

interface SortableItemProps {
    id: string;
    label: string;
    placeholder: string;
    handleChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, label, placeholder, handleChangeField }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled: isEditing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "10px",
        marginBottom: "8px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        cursor: "grab",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...(isEditing ? {} : listeners)}>
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={styles.formGroup}>
                <label className={styles.label}>Your label:</label>
                <input
                    data-id={id} onChange={handleChangeField}
                    className={styles.input}
                    name="label"
                    type="text"
                    value={label}
                    data-drag-disabled={isEditing}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Your placeholder:</label>
                <input
                    data-id={id} onChange={handleChangeField}
                    className={styles.input}
                    name="placeholder"
                    type="text"
                    value={placeholder}
                    data-drag-disabled={isEditing}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}

                />
            </div>
        </div>
    );
};

export default SortableItem;
