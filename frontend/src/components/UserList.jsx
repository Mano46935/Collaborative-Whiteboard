export default function UserList({users,selfId}){
    return(
        <div className="user-list">
            <span className="user-list-label">{users.length} online</span>
            <div className="avatar-stack">
                {users.map((u)=>(
                    <div
                    key={u.userId}
                    className="avatar"
                    style={{backgroundColor:u.color}}
                    title={u.userId===selfId ?`${u.userName} (you)`:u.userName}
                    >
                        {u.userName?.[0]?.toUpperCase()||"?"}
                        </div>
                ))}
            </div>
        </div>
    );
}