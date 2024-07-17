import React, { useEffect, useState } from 'react';
import {
    noteMap,
    harmonicFunctionToNote,
    invalidateQuestion,
    createHarmonicInterpretations,
    reorderHarmonicFunctions,
    getRandomNotes,
    findMostStableChord,
    simplifyNoteWithFlats,
    simplifyNoteWithSharps,
    getOrderedNotes
} from './HarmonicUtils';

const ChromaticAnalyzer = () => {
    const [question, setQuestion] = useState([]);
    const [harmonicInterpretations, setHarmonicInterpretations] = useState({});
    const [mostStableChord, setMostStableChord] = useState(null);
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        const newQuestion = getRandomNotes(4);
        setQuestion(newQuestion);
    }, []);

    useEffect(() => {
        if (question.length > 0) {
            const invalid = invalidateQuestion(question);
            setIsInvalid(invalid);

            if (!invalid) {
                const interpretations = createHarmonicInterpretations(question);
                setHarmonicInterpretations(interpretations);

                const bestChord = findMostStableChord(interpretations);
                setMostStableChord(bestChord);

                if (bestChord) {
                    const spelledChord = harmonicFunctionToNote(bestChord.root, reorderHarmonicFunctions(bestChord.harmonicFunctions));

                    const enharmonicRoot = bestChord.root.includes('♯')
                        ? simplifyNoteWithFlats(bestChord.root)
                        : bestChord.root.includes('♭')
                            ? simplifyNoteWithSharps(bestChord.root)
                            : null;

                    const enharmonicSpelledChord = enharmonicRoot
                        ? harmonicFunctionToNote(enharmonicRoot, reorderHarmonicFunctions(bestChord.harmonicFunctions))
                        : null;

                    const analyzedChord = {
                        root: enharmonicRoot
                            ? `${bestChord.root} / ${enharmonicRoot}`
                            : bestChord.root,
                        notes: question.map(note => noteMap[note]),
                        harmonicFunctionsFound: reorderHarmonicFunctions(bestChord.harmonicFunctions),
                        spelledChord: spelledChord.join(', '),
                        enharmonicSpelledChord: enharmonicSpelledChord ? enharmonicSpelledChord.join(', ') : null
                    };
                    
                }
            }
        }
    }, [question]);

    if (question.length === 0) {
        return <div>Loading...</div>;
    }

    const questionNotes = question.map(num => noteMap[num]).join(', ');
    const orderedNotes = getOrderedNotes(noteMap[question[0]], question.map(num => noteMap[num])).join(', ');

    return (
        <div>
            <div className="analysis-section">
                <h3>Question: {questionNotes}</h3>
                <h3>Ordered Notes: {orderedNotes}</h3>
                {isInvalid ? (
                    <div>No stable chords found</div>
                ) : (
                    <>
                        {Object.keys(harmonicInterpretations).map((root, index) => (
                            <div key={index}>
                                <h3>Root Note: {root}</h3>
                                <div>Harmonic Functions After Conversion: {
                                    reorderHarmonicFunctions(harmonicInterpretations[root].harmonicFunctions).join(' ')
                                }</div>
                                <div>Notes Order: {getOrderedNotes(root, harmonicInterpretations[root].notes).join(', ')}</div>
                                
                            </div>
                        ))}
                    </>
                )}
            </div>
            <h3>Most Stable Chord:</h3>
            {mostStableChord ? (
                <div>
                    <h4>Root Note: {mostStableChord.root.includes('♯') || mostStableChord.root.includes('♭')
                        ? `${mostStableChord.root} / ${mostStableChord.root.includes('♯') ? simplifyNoteWithFlats(mostStableChord.root) : simplifyNoteWithSharps(mostStableChord.root)}`
                        : mostStableChord.root}
                    </h4>
                    <div>Score: {mostStableChord.score}</div>
                    <div>Harmonic Functions: {reorderHarmonicFunctions(mostStableChord.harmonicFunctions).join(' ')}</div>
                    <div>Chord Notes: {harmonicFunctionToNote(mostStableChord.root, reorderHarmonicFunctions(mostStableChord.harmonicFunctions)).join(', ')}</div>
                    {(mostStableChord.root.includes('♯') || mostStableChord.root.includes('♭')) && (
                        <div>Enharmonic Chord Notes: {harmonicFunctionToNote(
                            mostStableChord.root.includes('♯') ? simplifyNoteWithFlats(mostStableChord.root) : simplifyNoteWithSharps(mostStableChord.root),
                            reorderHarmonicFunctions(mostStableChord.harmonicFunctions)
                        ).join(', ')}</div>
                    )}
                </div>
            ) : (
                <div>No valid chords found</div>
            )}
        </div>
    );
};

export default ChromaticAnalyzer;
