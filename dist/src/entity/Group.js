"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
var typeorm_1 = require("typeorm");
var Relation_1 = require("./Relation");
var Group = /** @class */ (function () {
    function Group() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Group.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Group.prototype, "title", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], Group.prototype, "description", void 0);
    __decorate([
        typeorm_1.Column('boolean', { default: false }),
        __metadata("design:type", Boolean)
    ], Group.prototype, "isDefaultGroup", void 0);
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "created_at"
        }),
        __metadata("design:type", Date)
    ], Group.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updated_at"
        }),
        __metadata("design:type", Date)
    ], Group.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Relation_1.Relation; }, function (relation) { return relation.group; }),
        __metadata("design:type", Array)
    ], Group.prototype, "relations", void 0);
    Group = __decorate([
        typeorm_1.Entity()
    ], Group);
    return Group;
}());
exports.Group = Group;
//# sourceMappingURL=Group.js.map