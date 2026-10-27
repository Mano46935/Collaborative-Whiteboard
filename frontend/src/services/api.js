export const SERVER_URL=import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
async function handle(res){
    if(!res.ok){
        const body=await res.json().catch(()=>({}));
        throw new Error(body.message|| `Request failed ${res.status}`);
    }
    return res.json();
}
export const api={
    login(username,password){
        return fetch(`${SERVER_URL}/api/login`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:"include",
            body:JSON.stringify({username,password})
        }).then(handle);
    },
    checkAvailability(username,email){
        return fetch(`${SERVER_URL}/api/login/check`,{
            method:"POST",
            headers:{"Content-Type":"application/json"
            },
            body:JSON.stringify({username,email}),
        }).then(handle);

    },
    register(username,email,password){
        return fetch(`${SERVER_URL}/api/login/Register`,{
           method:"POST",
           headers:{"Content-Type":"application/json"},
           credentials:"include",
           body:JSON.stringify({username,email,password})
        }).then(handle);

    },
    getMe(){
return fetch(`${SERVER_URL}/api/auth/me`,{
    credentials:"include"
}).then(handle);
    },
    listBoards (){
        return fetch(`${SERVER_URL}/api/boards`,{credentials:"include"}).then(handle);
    },
    createBoard({name,visibility}){
        return fetch(`${SERVER_URL}/api/boards`,{
            method:"POST",
           headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name,visibility }),
      credentials:"include"

        }).then(handle);
    },
    getBoard(id){
        return fetch(`${SERVER_URL}/api/boards/${id}`,{credentials:
            "include"
        }).then(handle);

    },
    deleteBoard(id){
        return fetch(`${SERVER_URL}/api/boards/${id}`,{
            method:"DELETE",credentials:"include"
        }).then(handle);
    },
    getBoardMetadata(id){
        return fetch(`${SERVER_URL}/api/boards/${id}/metadata`,{credentials:"include"}).then(handle);

    },
    joinBoard(id, inviteCode) {
    return fetch(`${SERVER_URL}/api/boards/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteCode }),
    }).then(handle);
},
};

