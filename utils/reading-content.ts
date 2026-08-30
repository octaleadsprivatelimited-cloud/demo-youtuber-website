export type ReadingBlock={kind:'paragraph'|'heading';text:string;level?:number}|{kind:'list';items:string[]};
export function parseReadingContent(text:string):ReadingBlock[]{
  const blocks:ReadingBlock[]=[];let paragraph:string[]=[];let list:string[]=[];
  const flushParagraph=()=>{if(paragraph.length){blocks.push({kind:'paragraph',text:paragraph.join('\n')});paragraph=[];}};
  const flushList=()=>{if(list.length){blocks.push({kind:'list',items:list});list=[];}};
  for(const line of text.replaceAll('\r\n','\n').split('\n')){
    const heading=line.match(/^(#{1,3})\s+(.+)$/);const bullet=line.match(/^[-*]\s+(.+)$/);
    if(!line.trim()){flushParagraph();flushList();}
    else if(heading){flushParagraph();flushList();blocks.push({kind:'heading',text:heading[2],level:heading[1].length<3?2:3});}
    else if(bullet){flushParagraph();list.push(bullet[1]);}
    else{flushList();paragraph.push(line);}
  }
  flushParagraph();flushList();return blocks;
}
