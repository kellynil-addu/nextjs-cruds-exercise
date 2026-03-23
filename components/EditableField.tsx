
// This component displays a clickable text.
// Once clicked. The text can be edited and can then be cancelled or confirmed.
// Can also pass a callback to trigger once an edit is confirmed. (ex: update to database)

import { LucidePencil, LucideSave } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { inputTextStyle } from "./BasicComponents";

export default function EditableField({value = "", onChange}: {value?: string, onChange?: (arg0: string) => void}) {
    const [isEditing, setEditing] = useState(false);
    const [valueState, setValue] = useState(value);

    const Viewing = () => {
        const [isHovered, setHovered] = useState(false);
        
        return (
            <div className="flex items-center relative gap-3">
                <span onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="cursor-pointer" onClick={() => setEditing(true)}>  
                    {valueState}
                </span>
                {isHovered ? <LucidePencil size={18} stroke="gray"/> : null}
            </div>
        );
    }
    
    const Editing = () => {
        const [input, setInput] = useState(valueState);
        const mouseOn = useRef(true);
        const divRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const onSave = () => {
            setValue(input);
            if (onChange) onChange(input);
            setEditing(false);
        }

        useEffect(() => {
            inputRef.current?.focus();
        }, []);

        const onMouseDown = () => {
            if (!mouseOn.current) setEditing(false);
        }

        useEffect(() => {
            document.addEventListener("mousedown", onMouseDown)
            return () => {
                document.removeEventListener("mousedown", onMouseDown)
            }
        }, [])

        return (
            <div onMouseEnter={() => mouseOn.current = true} onMouseLeave={() => mouseOn.current = false} ref={divRef} className="flex items-center relative gap-3">
                <input ref={inputRef} className={`field-sizing-content ${inputTextStyle}`} type="text" defaultValue={input} onChange={(e) => setInput(e.target.value)}/>
                <LucideSave size={18} className={`cursor-pointer`} onClick={onSave}></LucideSave>
            </div>
        )
    }

    return (
        <div className="w-full">
            {isEditing ? <Editing/> : <Viewing/>}
        </div>  
    )
}