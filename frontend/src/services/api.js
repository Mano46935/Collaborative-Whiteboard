export const SERVER_URL=import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
async function handle(res){
    if(!res.ok){
        const body=await res.json().catch(()=>({}));
        throw new Error(body.message|| `Request failed ${res.status}`);
    }
    return res.json();
}
export const api={
    listBoards (){
        return fetch(`${SERVER_URL}/api/boards`).then(handle);
    },
    createBoard(name){
        return fetch(`${SERVER_URL}/api/boards`,{
            method:"POST",
           headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),

        }).then(handle);
    },
    getBoard(id){
        return fetch(`${SERVER_URL}/api/boards/${id}`).then(handle);

    },
    deleteBoard(id){
        return fetch(`${SERVER_URL}/api/boards/${id}`,{
            method:"DELETE",
        }).then(handle);
    }
};

