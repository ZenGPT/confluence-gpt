import React, { useEffect } from 'react';
import mermaid from 'mermaid';

const Mermaid = ({ dsl = '' }) => {
  const [svg, setSvg] = React.useState([]);

  mermaid.mermaidAPI.initialize({ startOnLoad: true });

  useEffect(() => {
    if(dsl && typeof dsl === 'string') {
      mermaid.mermaidAPI.render('any-id', dsl).then(({ svg }) => {
        setSvg(svg)
      });
    }
  }, [dsl]);

  return (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

export default Mermaid;
