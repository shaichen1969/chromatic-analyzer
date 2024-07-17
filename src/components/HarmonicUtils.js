// src/components/HarmonicUtils.js
const noteMap = {
    0: 'C', 1: 'C♯', 2: 'D', 3: 'D♯', 4: 'E', 5: 'F',
    6: 'F♯', 7: 'G', 8: 'G♯', 9: 'A', 10: 'A♯', 11: 'B'
};

const majorScales = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'C♯': ['C♯', 'D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B♯'],
    'D♭': ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C'],
    'D': ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'],
    'D♯': ['D♯', 'E♯', 'F♯♯', 'G♯', 'A♯', 'B♯', 'C♯♯'],
    'E♭': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'],
    'E': ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'],
    'F': ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'],
    'F♯': ['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'],
    'G♭': ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'],
    'G♯': ['G♯', 'A♯', 'B♯', 'C♯', 'D♯', 'E♯', 'F♯♯'],
    'A♭': ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'],
    'A': ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'],
    'A♯': ['A♯', 'B♯', 'C♯♯', 'D♯', 'E♯', 'F♯♯', 'G♯♯'],
    'B♭': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'],
    'B': ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯']
};

const harmonicFunctionMap = {
    0: '1', 1: '♭9', 2: '9', 3: '♭3', 4: '3', 5: '11',
    6: '♭5', 7: '5', 8: '♯5', 9: '13', 10: '♭7', 11: '7'
};

const displayOrder = ['1', '♭3', '3', '♭5', '5', '♯5', '♭7', '7', '♭9', '9', '♯9', '11', '♯11', '♭13', '13'];

const scoreMap = {
    '1': 0, '♭3': 3, '3': 3, '♭5': 5, '5': 5, '♯5': 5,
    '♭7': 7, '7': 7, '♭9': 9, '9': 9, '♯9': 9,
    '11': 11, '♯11': 11, '♭13': 13, '13': 13
};

const harmonicFunctionToNote = (root, harmonicFunctions) => {
    const scale = majorScales[root];
    if (!scale) return [];

    return harmonicFunctions.map(func => {
        switch (func) {
            case '1': return scale[0];
            case '♭3': return simplifyNote(scale[2] + '♭');
            case '3': return scale[2];
            case '♭5': return simplifyNote(scale[4] + '♭');
            case '5': return scale[4];
            case '♭7': return simplifyNote(scale[6] + '♭');
            case '7': return scale[6];
            case '9': return scale[1];
            case '♭9': return simplifyNote(scale[1] + '♭');
            case '♯9': return simplifyNote(scale[1] + '♯');
            case '11': return scale[3];
            case '♯11': return simplifyNote(scale[3] + '♯');
            case '♭13': return simplifyNote(scale[5] + '♭');
            case '13': return scale[5];
            default: return '';
        }
    }).filter(note => note !== '');
};

const convertToTensions = (harmonicFunctions) => {
    const containsFlat3 = harmonicFunctions.includes('♭3');
    const contains3 = harmonicFunctions.includes('3');
    const containsFlat5 = harmonicFunctions.includes('♭5');
    const contains5 = harmonicFunctions.includes('5');
    const containsSharp5 = harmonicFunctions.includes('♯5');

    harmonicFunctions.forEach((func, index) => {
        if (func === '♭3' && contains3) {
            harmonicFunctions[index] = '♯9';
        }
        if (func === '♭5' && contains5) {
            harmonicFunctions[index] = '♯11';
        }
        if (func === '♯5' && (contains5 || containsFlat5)) {
            harmonicFunctions[index] = '♭13';
        }
    });

    // Remove duplicates
    return [...new Set(harmonicFunctions)];
};

const invalidateQuestion = (question) => {
    const sortedQuestion = [...question].sort((a, b) => a - b);

    // Check for three consecutive semitones within the array
    for (let i = 0; i < sortedQuestion.length - 2; i++) {
        if ((sortedQuestion[i + 1] - sortedQuestion[i] === 1) &&
            (sortedQuestion[i + 2] - sortedQuestion[i + 1] === 1)) {
            return true;
        }
    }

    // Check for wrapping around from highest to lowest note
    if ((sortedQuestion[sortedQuestion.length - 1] === 11 && sortedQuestion[0] === 0 && sortedQuestion[1] === 1) ||
        (sortedQuestion[sortedQuestion.length - 2] === 11 && sortedQuestion[sortedQuestion.length - 1] === 0 && sortedQuestion[0] === 1) ||
        (sortedQuestion[sortedQuestion.length - 1] === 11 && sortedQuestion[0] === 0 && sortedQuestion[1] === 2)) {
        return true;
    }

    return false;
};

const createHarmonicInterpretations = (question) => {
    let interpretations = {};

    question.forEach(root => {
        let harmonicFunctions = question.map(number =>
            harmonicFunctionMap[(number - root + 12) % 12]
        );

        // Invalidate chord if it contains both ♭3 and ♯5
        if (harmonicFunctions.includes('♭3') && harmonicFunctions.includes('♯5')) {
            return interpretations;
        }
        if (harmonicFunctions.includes('7') && harmonicFunctions.includes('♭9')) {
            return interpretations;
        }

        const tensionFunctions = convertToTensions([...harmonicFunctions]); // Copy array for comparison

        interpretations[noteMap[root]] = {
            root: noteMap[root],
            notes: question.map(note => noteMap[note]),
            harmonicFunctions: tensionFunctions,
            harmonicFunctionsBefore: harmonicFunctions // Store the original functions for display
        };
    });

    return interpretations;
};

const simplifyNote = (note) => {
    const noteWithoutAccidentals = note.replace(/[♯♭]/g, '');
    const accidentals = note.replace(/[A-G]/g, '');

    let semitones = 0;
    for (let acc of accidentals) {
        semitones += acc === '♯' ? 1 : -1;
    }

    const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let index = noteOrder.indexOf(noteWithoutAccidentals);

    // Adjust index and semitones
    index = (index + Math.floor(semitones / 2) + 7) % 7;
    semitones = semitones % 2;

    // Handle cases where semitones wrap around
    if (semitones === -1 && noteOrder[index] === 'C') {
        semitones = 0;
        index = (index - 1 + 7) % 7;
    }
    if (semitones === -1 && noteOrder[index] === 'F') {
        semitones = 0;
        index = (index - 1 + 7) % 7;
    }

    let newNote = noteOrder[index];

    if (semitones === 1) return newNote + '♯';
    if (semitones === -1) return newNote + '♭';
    return newNote;
};

const simplifyNoteWithSharps = (note) => {
    const flatToSharp = {
        'B♭': 'A♯', 'E♭': 'D♯', 'A♭': 'G♯', 'D♭': 'C♯', 'G♭': 'F♯', 'C♭': 'B', 'F♭': 'E'
    };
    return flatToSharp[note] || note;
};

const simplifyNoteWithFlats = (note) => {
    const sharpToFlat = {
        'A♯': 'B♭', 'D♯': 'E♭', 'G♯': 'A♭', 'C♯': 'D♭', 'F♯': 'G♭', 'B': 'C♭', 'E': 'F♭'
    };
    return sharpToFlat[note] || note;
};

const reorderHarmonicFunctions = (harmonicFunctions) => {
    return displayOrder.filter(func => harmonicFunctions.includes(func));
};

const getRandomNotes = (numNotes) => {
    const notes = [];
    while (notes.length < numNotes) {
        const randomNote = Math.floor(Math.random() * 12);
        if (!notes.includes(randomNote)) {
            notes.push(randomNote);
        }
    }
    return notes;
};

const getOrderedNotes = (root, notes) => {
    const rootIndex = Object.keys(noteMap).find(key => noteMap[key] === root);
    let chromaticScale = [];

    for (let i = 0; i < 12; i++) {
        chromaticScale.push(noteMap[(parseInt(rootIndex) + i) % 12]);
    }

    return chromaticScale.filter(note => notes.includes(note));
};

const calculateChordScore = (harmonicFunctions) => {
    return harmonicFunctions.reduce((score, func) => score + (scoreMap[func] || 0), 0);
};

const findMostStableChord = (interpretations) => {
    let bestChord = null;
    let lowestScore = Infinity;

    for (const root in interpretations) {
        const { harmonicFunctions } = interpretations[root];
        const score = calculateChordScore(harmonicFunctions);

        if (score < lowestScore) {
            lowestScore = score;
            bestChord = { root, score, harmonicFunctions };
        }
    }

    return bestChord;
};

export {
    noteMap,
    majorScales,
    harmonicFunctionMap,
    displayOrder,
    scoreMap,
    harmonicFunctionToNote,
    convertToTensions,
    invalidateQuestion,
    createHarmonicInterpretations,
    simplifyNote,
    simplifyNoteWithSharps,
    simplifyNoteWithFlats,
    reorderHarmonicFunctions,
    getRandomNotes,
    getOrderedNotes,
    calculateChordScore,
    findMostStableChord
};
