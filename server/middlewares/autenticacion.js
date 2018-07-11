const jwt=require('jsonwebtoken');
// ============================
//  Verifica token
// ============================
let verificaToken=(req, res, next)=>{
	let token =req.get('token');

	jwt.verify(token, process.env.SEED, (err, decoded)=>{
		if(err){
			return res.status(401).json({
				ok: false,
				err:{
					message: 'Token no válido'
				}
			});
		}

		req.usuario=decoded.usuario;

		next();
	});
};

// ============================
//  Verifica admin_role
// ============================
let verificaAdminRole=(req, res, next)=>{
	let usuario=req.usuario;

	if(usuario.role!=='ADMIN_ROLE'){
		return res.status(401).json({
			ok: false,
			err:{
				message: 'Usuario no autorizado'
			}
		});
	}

	next();
};

// ============================
//  Verifica token para imagenes
// ============================
let verificaTokenImg=(req, res, next)=>{
	let token=req.query.token;

	jwt.verify(token, process.env.SEED, (err, decoded)=>{
		if(err){
			return res.status(401).json({
				ok: false,
				err:{
					message: 'Token no válido'
				}
			});
		}

		req.usuario=decoded.usuario;

		next();
	});
};

module.exports={
	verificaToken,
	verificaAdminRole,
	verificaTokenImg
}