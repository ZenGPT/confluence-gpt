import React, { useEffect } from 'react';

const Mermaid = ({ dsl = '' }) => {
  const [svg, setSvg] = React.useState([]);

  //@ts-ignore
  window.mermaid.mermaidAPI.initialize({ startOnLoad: true });

  useEffect(() => {
    if(dsl && typeof dsl === 'string') {
      //@ts-ignore
      window.mermaid.mermaidAPI.render('any-id', dsl).then(({ svg }) => {
        setSvg(svg)
      });
    }
  }, [dsl]);

  return (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

export default Mermaid;
