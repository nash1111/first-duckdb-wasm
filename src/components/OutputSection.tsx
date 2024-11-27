import React from 'react';

import { Output } from '../App';

interface OutputSectionProps {
    output: Output | null;
}

const OutputSection: React.FC<OutputSectionProps> = ({ output }) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
            <h2 style={{ margin: 0, paddingBottom: '10px' }}>Output</h2>
            {output?.data ? (
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {Object.keys(output.data[0] || {}).map((key, index) => (
                                <th key={index}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {output.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex}>{typeof value === 'number' ? value : String(value)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <pre style={{ flex: 1, backgroundColor: '#f4f4f4', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', overflowY: 'scroll' }}>
                    {output?.message || 'No results to display.'}
                </pre>
            )}
        </div>
    );
};

export default OutputSection; 