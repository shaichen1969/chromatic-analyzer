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
    const [analyzedChord, setAnalyzedChord] = useState(null);

    const countAccidentals = (notes) => {
        return notes.reduce((count, note) => {
            if (note.includes('♯') || note.includes('♭')) {
                return count + 1;
            }
            return count;
        }, 0);
    };

    const selectPreferredSpelling = (sharpSpelling, flatSpelling) => {
        const sharpAccidentals = countAccidentals(sharpSpelling);
        const flatAccidentals = countAccidentals(flatSpelling);
        return flatAccidentals <= sharpAccidentals ? 'flat' : 'sharp';
    };

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
                    const harmonicFunctions = reorderHarmonicFunctions(bestChord.harmonicFunctions);
                    const spelledChord = harmonicFunctionToNote(bestChord.root, harmonicFunctions);

                    const enharmonicRoot = bestChord.root.includes('♯')
                        ? simplifyNoteWithFlats(bestChord.root)
                        : bestChord.root.includes('♭')
                            ? simplifyNoteWithSharps(bestChord.root)
                            : null;

                    const enharmonicSpelledChord = enharmonicRoot
                        ? harmonicFunctionToNote(enharmonicRoot, harmonicFunctions)
                        : null;

                    const preferredSpelling = selectPreferredSpelling(spelledChord, enharmonicSpelledChord || spelledChord);

                    const newAnalyzedChord = {
                        root: enharmonicRoot
                            ? `${bestChord.root} / ${enharmonicRoot}`
                            : bestChord.root,
                        notes: question.map(note => noteMap[note]),
                        harmonicFunctionsFound: harmonicFunctions,
                        spelledChord: spelledChord.join(', '),
                        enharmonicSpelledChord: enharmonicSpelledChord ? enharmonicSpelledChord.join(', ') : null,
                        preferredSpelling: preferredSpelling,
                        preferredSpellingNotes: preferredSpelling === 'sharp' ? spelledChord.join(', ') : (enharmonicSpelledChord ? enharmonicSpelledChord.join(', ') : spelledChord.join(', '))
                    };
                    setAnalyzedChord(newAnalyzedChord);
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
            {analyzedChord ? (
                <div>
                    <h4>Root Note: {analyzedChord.root}</h4>
                    <div>Score: {mostStableChord.score}</div>
                    <div>Harmonic Functions: {analyzedChord.harmonicFunctionsFound.join(' ')}</div>
                    <div>Chord Notes: {analyzedChord.spelledChord}</div>
                    {analyzedChord.enharmonicSpelledChord && (
                        <div>Enharmonic Chord Notes: {analyzedChord.enharmonicSpelledChord}</div>
                    )}
                    <div>Preferred Spelling: {analyzedChord.preferredSpelling}</div>
                    <div>Preferred Spelling Notes: {analyzedChord.preferredSpellingNotes}</div>
                </div>
            ) : (
                <div>No valid chords found</div>
            )}
        </div>
    );
};

export default ChromaticAnalyzer;