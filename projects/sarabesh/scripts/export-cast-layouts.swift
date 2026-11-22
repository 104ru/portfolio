import Foundation
struct Entry:Decodable {let file:String;let geometry:PartGeometry}
let entries=try JSONDecoder().decode([Entry].self,from:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1])))
let metrics=Dictionary(uniqueKeysWithValues:entries.map{($0.file.replacingOccurrences(of:".png",with:""),$0.geometry)})
let recipes:[[Int]]=[[6,5,1,3,5,1],[2,2,4,9,2,4],[11,8,8,5,4,11],[3,3,3,11,8,6],[14,4,9,2,6,2],[9,9,5,10,1,8],[1,6,2,4,3,3],[12,10,11,12,11,9],[7,11,6,8,10,5],[15,13,10,6,9,7],[4,7,12,13,12,12],[10,12,13,15,14,10]]
var output:[[String:Any]]=[]
for (index,r) in recipes.enumerated(){
 let c=Composition(parts:[.frame:r[0],.legs:r[1],.sensor:r[2],.hand:r[3],.antenna:r[4],.detail:r[5]])
 let layout=CharacterLayout(composition:c,geometry:metrics)
 let poses:[[String:Any]]=layout.poses.map{p in ["id":p.id,"category":p.category.rawValue,"file":p.category.file(p.variant)+".png","x":p.x,"y":p.y,"width":p.width,"height":p.height,"rotation":p.rotation,"mirrored":p.mirrored]}
 output.append(["id":"resident-\(index+1)","parts":r,"poses":poses])
}
let data=try JSONSerialization.data(withJSONObject:output,options:[.prettyPrinted,.sortedKeys]);FileHandle.standardOutput.write(data)
