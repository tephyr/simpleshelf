/**
 * list function: all books, as HTML list
 */
function(head, req){
    provides("html", function(){
        //send("<html><body>");
        send("<ul>");
        while (row = getRow()) {
            send(renderBook(row));
        }
        send("</ul>");
        //send("</body></html>");
    });
}

function renderBook(row){
    var title = row.value.title || "[No title]";
    var author = row.value.author || "[No author]";
    return '<li><a href="#"' + row.id + '>' + title + '</a> by ' + author + '</li>';
}
