



local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local LocalPlayer = Players.LocalPlayer

-- combat
local killAuraToggle = false
local chopAuraToggle = false
local auraRadius = 50
local currentammount = 0

local toolsDamageIDs = {
    ["Old Axe"] = "3_7367831688",
    ["Good Axe"] = "112_7367831688",
    ["Strong Axe"] = "116_7367831688",
    ["Chainsaw"] = "647_8992824875",
    ["Spear"] = "196_8999010016"
}

-- auto food
local autoFeedToggle = false
local selectedFood = "Carrot"
local hungerThreshold = 75
local alwaysFeedEnabledItems = {}
local alimentos = {
    "Apple",
    "Berry",
    "Carrot",
    "Cake",
    "Chili",
    "Cooked Morsel",
    "Cooked Steak"
}

-- esp
local ie = {
    "Bandage", "Bolt", "Broken Fan", "Broken Microwave", "Cake", "Carrot", "Chair", "Coal", "Coin Stack",
    "Cooked Morsel", "Cooked Steak", "Fuel Canister", "Iron Body", "Leather Armor", "Log", "MadKit", "Metal Chair",
    "MedKit", "Old Car Engine", "Old Flashlight", "Old Radio", "Revolver", "Revolver Ammo", "Rifle", "Rifle Ammo",
    "Morsel", "Sheet Metal", "Steak", "Tyre", "Washing Machine"
}
local me = {"Bunny", "Wolf", "Alpha Wolf", "Bear", "Cultist", "Crossbow Cultist", "Alien"}

-- ESP variables
local espItemsEnabled = false
local espMobsEnabled = false
local selectedItems = {}
local selectedMobs = {}
local espObjects = {}

local campfireFuelItems = {"Log", "Coal", "Fuel Canister", "Oil Barrel", "Biofuel"}
local campfireDropPos = Vector3.new(0, 19, 0)

-- auto cook
local autocookItems = {"Morsel", "Steak"}
local autoCookEnabledItems = {}
local autoCookEnabled = false

-- Player variables
local speed = 16
local noclipConnection
local infJumpConnection
local speedConnection

-- Misc variables
local instantInteractEnabled = false
local originalHoldDurations = {}
local instantInteractConnection
local torchLoop

-- ESP Functions
local function createESP(obj, name, color)
    if espObjects[obj] then return end
    
    local billboard = Instance.new("BillboardGui")
    billboard.Name = "ESP_" .. name
    billboard.Adornee = obj
    billboard.Size = UDim2.new(0, 100, 0, 50)
    billboard.StudsOffset = Vector3.new(0, 2, 0)
    billboard.AlwaysOnTop = true
    
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, 0, 1, 0)
    frame.BackgroundTransparency = 1
    frame.Parent = billboard
    
    local textLabel = Instance.new("TextLabel")
    textLabel.Size = UDim2.new(1, 0, 1, 0)
    textLabel.BackgroundTransparency = 1
    textLabel.Text = name
    textLabel.TextColor3 = color or Color3.fromRGB(255, 255, 255)
    textLabel.TextScaled = true
    textLabel.Font = Enum.Font.SourceSansBold
    textLabel.TextStrokeTransparency = 0
    textLabel.Parent = frame
    
    billboard.Parent = obj
    espObjects[obj] = billboard
end

local function removeESP(obj)
    if espObjects[obj] then
        espObjects[obj]:Destroy()
        espObjects[obj] = nil
    end
end

local function Aesp(itemName, espType)
    local container = espType == "item" and Workspace:FindFirstChild("Items") or Workspace:FindFirstChild("Characters")
    if not container then return end
    
    local color = espType == "item" and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(255, 0, 0)
    
    for _, obj in ipairs(container:GetChildren()) do
        if obj.Name == itemName then
            local part = obj:IsA("Model") and (obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")) or obj
            if part then
                createESP(part, itemName, color)
            end
        end
    end
    
    -- Connect to new items/mobs being added
    container.ChildAdded:Connect(function(child)
        if child.Name == itemName then
            local part = child:IsA("Model") and (child.PrimaryPart or child:FindFirstChildWhichIsA("BasePart")) or child
            if part then
                createESP(part, itemName, color)
            end
        end
    end)
end

local function Desp(itemName, espType)
    local container = espType == "item" and Workspace:FindFirstChild("Items") or Workspace:FindFirstChild("Characters")
    if not container then return end
    
    for _, obj in ipairs(container:GetChildren()) do
        if obj.Name == itemName then
            local part = obj:IsA("Model") and (obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")) or obj
            if part then
                removeESP(part)
            end
        end
    end
end

-- Player Functions
local function setSpeed(newSpeed)
    if speedConnection then
        speedConnection:Disconnect()
    end
    
    if newSpeed > 16 then
        speedConnection = RunService.Heartbeat:Connect(function()
            local character = LocalPlayer.Character
            local humanoid = character and character:FindFirstChildOfClass("Humanoid")
            if humanoid then
                humanoid.WalkSpeed = newSpeed
            end
        end)
    end
end

local function getAnyToolWithDamageID(isChopAura)
    for toolName, damageID in pairs(toolsDamageIDs) do
        if isChopAura and toolName ~= "Old Axe" and toolName ~= "Good Axe" and toolName ~= "Strong Axe" then
            continue
        end
        local tool = LocalPlayer:FindFirstChild("Inventory") and LocalPlayer.Inventory:FindFirstChild(toolName)
        if tool then
            return tool, damageID
        end
    end
    return nil, nil
end

local function equipTool(tool)
    if tool then
        ReplicatedStorage:WaitForChild("RemoteEvents").EquipItemHandle:FireServer("FireAllClients", tool)
    end
end

local function unequipTool(tool)
    if tool then
        ReplicatedStorage:WaitForChild("RemoteEvents").UnequipItemHandle:FireServer("FireAllClients", tool)
    end
end

local function killAuraLoop()
    while killAuraToggle do
        local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
        local hrp = character:FindFirstChild("HumanoidRootPart")
        if hrp then
            local tool, damageID = getAnyToolWithDamageID(false)
            if tool and damageID then
                equipTool(tool)
                for _, mob in ipairs(Workspace.Characters:GetChildren()) do
                    if mob:IsA("Model") then
                        local part = mob:FindFirstChildWhichIsA("BasePart")
                        if part and (part.Position - hrp.Position).Magnitude <= auraRadius then
                            pcall(function()
                                ReplicatedStorage:WaitForChild("RemoteEvents").ToolDamageObject:InvokeServer(
                                    mob,
                                    tool,
                                    damageID,
                                    CFrame.new(part.Position)
                                )
                            end)
                        end
                    end
                end
                task.wait(0.1)
            else
                task.wait(1)
            end
        else
            task.wait(0.5)
        end
    end
end

local function chopAuraLoop()
    while chopAuraToggle do
        local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
        local hrp = character:FindFirstChild("HumanoidRootPart")
        if hrp then
            local tool, baseDamageID = getAnyToolWithDamageID(true)
            if tool and baseDamageID then
                equipTool(tool)
                currentammount = currentammount + 1
                local trees = {}
                local map = Workspace:FindFirstChild("Map")
                if map then
                    if map:FindFirstChild("Foliage") then
                        for _, obj in ipairs(map.Foliage:GetChildren()) do
                            if obj:IsA("Model") and obj.Name == "Small Tree" then
                                table.insert(trees, obj)
                            end
                        end
                    end
                    if map:FindFirstChild("Landmarks") then
                        for _, obj in ipairs(map.Landmarks:GetChildren()) do
                            if obj:IsA("Model") and obj.Name == "Small Tree" then
                                table.insert(trees, obj)
                            end
                        end
                    end
                end
                for _, tree in ipairs(trees) do
                    local trunk = tree:FindFirstChild("Trunk")
                    if trunk and trunk:IsA("BasePart") and (trunk.Position - hrp.Position).Magnitude <= auraRadius then
                        local alreadyammount = false
                        task.spawn(function()
                            while chopAuraToggle and tree and tree.Parent and not alreadyammount do
                                alreadyammount = true
                                currentammount = currentammount + 1
                                pcall(function()
                                    ReplicatedStorage:WaitForChild("RemoteEvents").ToolDamageObject:InvokeServer(
                                        tree,
                                        tool,
                                        tostring(currentammount) .. "_7367831688",
                                        CFrame.new(-2.962610244751, 4.5547881126404, -75.950843811035, 0.89621275663376, -1.3894891459643e-08, 0.44362446665764, -7.994568895775e-10, 1, 3.293635941759e-08, -0.44362446665764, -2.9872644802253e-08, 0.89621275663376)
                                    )
                                end)
                                task.wait(0.5)
                            end
                        end)
                    end
                end
                task.wait(0.1)
            else
                task.wait(1)
            end
        else
            task.wait(0.5)
        end
    end
end

function wiki(nome)
    local c = 0
    for _, i in ipairs(Workspace.Items:GetChildren()) do
        if i.Name == nome then
            c = c + 1
        end
    end
    return c
end

function ghn()
    return math.floor(LocalPlayer.PlayerGui.Interface.StatBars.HungerBar.Bar.Size.X.Scale * 100)
end

function feed(nome)
    for _, item in ipairs(Workspace.Items:GetChildren()) do
        if item.Name == nome then
            ReplicatedStorage.RemoteEvents.RequestConsumeItem:InvokeServer(item)
            break
        end
    end
end

function notifeed(nome)
    -- Notification placeholder
    print("Auto Food Paused - The food is gone")
end

local function moveItemToPos(item, position)
    if not item or not item:IsDescendantOf(workspace) or not item:IsA("BasePart") and not item:IsA("Model") then return end
    local part = item:IsA("Model") and (item.PrimaryPart or item:FindFirstChildWhichIsA("BasePart") or item:FindFirstChild("Handle")) or item
    if not part or not part:IsA("BasePart") then return end

    if item:IsA("Model") and not item.PrimaryPart then
        pcall(function() item.PrimaryPart = part end)
    end

    pcall(function()
        game:GetService("ReplicatedStorage"):WaitForChild("RemoteEvents").RequestStartDraggingItem:FireServer(item)
        if item:IsA("Model") then
            item:SetPrimaryPartCFrame(CFrame.new(position))
        else
            part.CFrame = CFrame.new(position)
        end
        game:GetService("ReplicatedStorage"):WaitForChild("RemoteEvents").StopDraggingItem:FireServer(item)
    end)
end

local function getChests()
    local chests = {}
    local chestNames = {}
    local index = 1
    for _, item in ipairs(workspace:WaitForChild("Items"):GetChildren()) do
        if item.Name:match("^Item Chest") and not item:GetAttribute("8721081708Opened") then
            table.insert(chests, item)
            table.insert(chestNames, "Chest " .. index)
            index = index + 1
        end
    end
    return chests, chestNames
end

local currentChests, currentChestNames = getChests()
local selectedChest = currentChestNames[1] or nil

local function getMobs()
    local mobs = {}
    local mobNames = {}
    local index = 1
    for _, character in ipairs(workspace:WaitForChild("Characters"):GetChildren()) do
        if character.Name:match("^Lost Child") and character:GetAttribute("Lost") == true then
            table.insert(mobs, character)
            table.insert(mobNames, character.Name)
            index = index + 1
        end
    end
    return mobs, mobNames
end

local currentMobs, currentMobNames = getMobs()
local selectedMob = currentMobNames[1] or nil

function tp1()
    (game.Players.LocalPlayer.Character or game.Players.LocalPlayer.CharacterAdded:Wait()):WaitForChild("HumanoidRootPart").CFrame =
    CFrame.new(0.43132782, 15.77634621, -1.88620758, -0.270917892, 0.102997094, 0.957076371, 0.639657021, 0.762253821, 0.0990355015, -0.719334781, 0.639031112, -0.272391081)
end

local function tp2()
    local targetPart = workspace:FindFirstChild("Map")
        and workspace.Map:FindFirstChild("Landmarks")
        and workspace.Map.Landmarks:FindFirstChild("Stronghold")
        and workspace.Map.Landmarks.Stronghold:FindFirstChild("Functional")
        and workspace.Map.Landmarks.Stronghold.Functional:FindFirstChild("EntryDoors")
        and workspace.Map.Landmarks.Stronghold.Functional.EntryDoors:FindFirstChild("DoorRight")
        and workspace.Map.Landmarks.Stronghold.Functional.EntryDoors.DoorRight:FindFirstChild("Model")
    if targetPart then
        local children = targetPart:GetChildren()
        local destination = children[5]
        if destination and destination:IsA("BasePart") then
            local hrp = game.Players.LocalPlayer.Character and game.Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
            if hrp then
                hrp.CFrame = destination.CFrame + Vector3.new(0, 5, 0)
            end
        end
    end
end

local flyToggle = false
local flySpeed = 1
local FLYING = false
local flyKeyDown, flyKeyUp, mfly1, mfly2
local IYMouse = game:GetService("UserInputService")

-- Fly pc
local function sFLY()
    repeat task.wait() until Players.LocalPlayer and Players.LocalPlayer.Character and Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart") and Players.LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
    repeat task.wait() until IYMouse
    if flyKeyDown or flyKeyUp then flyKeyDown:Disconnect(); flyKeyUp:Disconnect() end

    local T = Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart")
    local CONTROL = {F = 0, B = 0, L = 0, R = 0, Q = 0, E = 0}
    local lCONTROL = {F = 0, B = 0, L = 0, R = 0, Q = 0, E = 0}
    local SPEED = flySpeed

    local function FLY()
        FLYING = true
        local BG = Instance.new('BodyGyro')
        local BV = Instance.new('BodyVelocity')
        BG.P = 9e4
        BG.Parent = T
        BV.Parent = T
        BG.MaxTorque = Vector3.new(9e9, 9e9, 9e9)
        BG.CFrame = T.CFrame
        BV.Velocity = Vector3.new(0, 0, 0)
        BV.MaxForce = Vector3.new(9e9, 9e9, 9e9)
        task.spawn(function()
            while FLYING do
                task.wait()
                if not flyToggle and Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid') then
                    Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid').PlatformStand = true
                end
                if CONTROL.L + CONTROL.R ~= 0 or CONTROL.F + CONTROL.B ~= 0 or CONTROL.Q + CONTROL.E ~= 0 then
                    SPEED = flySpeed
                elseif not (CONTROL.L + CONTROL.R ~= 0 or CONTROL.F + CONTROL.B ~= 0 or CONTROL.Q + CONTROL.E ~= 0) and SPEED ~= 0 then
                    SPEED = 0
                end
                if (CONTROL.L + CONTROL.R) ~= 0 or (CONTROL.F + CONTROL.B) ~= 0 or (CONTROL.Q + CONTROL.E) ~= 0 then
                    BV.Velocity = ((workspace.CurrentCamera.CoordinateFrame.lookVector * (CONTROL.F + CONTROL.B)) + ((workspace.CurrentCamera.CoordinateFrame * CFrame.new(CONTROL.L + CONTROL.R, (CONTROL.F + CONTROL.B + CONTROL.Q + CONTROL.E) * 0.2, 0).p) - workspace.CurrentCamera.CoordinateFrame.p)) * SPEED
                    lCONTROL = {F = CONTROL.F, B = CONTROL.B, L = CONTROL.L, R = CONTROL.R}
                elseif (CONTROL.L + CONTROL.R) == 0 and (CONTROL.F + CONTROL.B) == 0 and (CONTROL.Q + CONTROL.E) == 0 and SPEED ~= 0 then
                    BV.Velocity = ((workspace.CurrentCamera.CoordinateFrame.lookVector * (lCONTROL.F + lCONTROL.B)) + ((workspace.CurrentCamera.CoordinateFrame * CFrame.new(lCONTROL.L + lCONTROL.R, (lCONTROL.F + lCONTROL.B + CONTROL.Q + CONTROL.E) * 0.2, 0).p) - workspace.CurrentCamera.CoordinateFrame.p)) * SPEED
                else
                    BV.Velocity = Vector3.new(0, 0, 0)
                end
                BG.CFrame = workspace.CurrentCamera.CoordinateFrame
            end
            CONTROL = {F = 0, B = 0, L = 0, R = 0, Q = 0, E = 0}
            lCONTROL = {F = 0, B = 0, L = 0, R = 0, Q = 0, E = 0}
            SPEED = 0
            BG:Destroy()
            BV:Destroy()
            if Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid') then
                Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid').PlatformStand = false
            end
        end)
    end
    flyKeyDown = IYMouse.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.Keyboard then
            local KEY = input.KeyCode.Name
            if KEY == "W" then
                CONTROL.F = flySpeed
            elseif KEY == "S" then
                CONTROL.B = -flySpeed
            elseif KEY == "A" then
                CONTROL.L = -flySpeed
            elseif KEY == "D" then 
                CONTROL.R = flySpeed
            elseif KEY == "E" then
                CONTROL.Q = flySpeed * 2
            elseif KEY == "Q" then
                CONTROL.E = -flySpeed * 2
            end
            pcall(function() workspace.CurrentCamera.CameraType = Enum.CameraType.Track end)
        end
    end)
    flyKeyUp = IYMouse.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.Keyboard then
            local KEY = input.KeyCode.Name
            if KEY == "W" then
                CONTROL.F = 0
            elseif KEY == "S" then
                CONTROL.B = 0
            elseif KEY == "A" then
                CONTROL.L = 0
            elseif KEY == "D" then
                CONTROL.R = 0
            elseif KEY == "E" then
                CONTROL.Q = 0
            elseif KEY == "Q" then
                CONTROL.E = 0
            end
        end
    end)
    FLY()
end

-- Fly mobile
local function NOFLY()
    FLYING = false
    if flyKeyDown then flyKeyDown:Disconnect() end
    if flyKeyUp then flyKeyUp:Disconnect() end
    if mfly1 then mfly1:Disconnect() end
    if mfly2 then mfly2:Disconnect() end
    if Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid') then
        Players.LocalPlayer.Character:FindFirstChildOfClass('Humanoid').PlatformStand = false
    end
    pcall(function() workspace.CurrentCamera.CameraType = Enum.CameraType.Custom end)
end

local function UnMobileFly()
    pcall(function()
        FLYING = false
        local root = Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart")
        if root:FindFirstChild("BodyVelocity") then root:FindFirstChild("BodyVelocity"):Destroy() end
        if root:FindFirstChild("BodyGyro") then root:FindFirstChild("BodyGyro"):Destroy() end
        if Players.LocalPlayer.Character:FindFirstChildWhichIsA("Humanoid") then
            Players.LocalPlayer.Character:FindFirstChildWhichIsA("Humanoid").PlatformStand = false
        end
        if mfly1 then mfly1:Disconnect() end
        if mfly2 then mfly2:Disconnect() end
    end)
end

local function MobileFly()
    UnMobileFly()
    FLYING = true

    local root = Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart")
    local camera = workspace.CurrentCamera
    local v3none = Vector3.new()
    local v3zero = Vector3.new(0, 0, 0)
    local v3inf = Vector3.new(9e9, 9e9, 9e9)

    local controlModule = require(Players.LocalPlayer.PlayerScripts:WaitForChild("PlayerModule"):WaitForChild("ControlModule"))
    local bv = Instance.new("BodyVelocity")
    bv.Name = "BodyVelocity"
    bv.Parent = root
    bv.MaxForce = v3zero
    bv.Velocity = v3zero

    local bg = Instance.new("BodyGyro")
    bg.Name = "BodyGyro"
    bg.Parent = root
    bg.MaxTorque = v3inf
    bg.P = 1000
    bg.D = 50

    mfly1 = Players.LocalPlayer.CharacterAdded:Connect(function()
        local newRoot = Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart")
        local newBv = Instance.new("BodyVelocity")
        newBv.Name = "BodyVelocity"
        newBv.Parent = newRoot
        newBv.MaxForce = v3zero
        newBv.Velocity = v3zero

        local newBg = Instance.new("BodyGyro")
        newBg.Name = "BodyGyro"
        newBg.Parent = newRoot
        newBg.MaxTorque = v3inf
        newBg.P = 1000
        newBg.D = 50
    end)

    mfly2 = game:GetService("RunService").RenderStepped:Connect(function()
        root = Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart")
        camera = workspace.CurrentCamera
        if Players.LocalPlayer.Character:FindFirstChildWhichIsA("Humanoid") and root and root:FindFirstChild("BodyVelocity") and root:FindFirstChild("BodyGyro") then
            local humanoid = Players.LocalPlayer.Character:FindFirstChildWhichIsA("Humanoid")
            local VelocityHandler = root:FindFirstChild("BodyVelocity")
            local GyroHandler = root:FindFirstChild("BodyGyro")

            VelocityHandler.MaxForce = v3inf
            GyroHandler.MaxTorque = v3inf
            humanoid.PlatformStand = true
            GyroHandler.CFrame = camera.CoordinateFrame
            VelocityHandler.Velocity = v3none

            local direction = controlModule:GetMoveVector()
            if direction.X > 0 then
                VelocityHandler.Velocity = VelocityHandler.Velocity + camera.CFrame.RightVector * (direction.X * (flySpeed * 50))
            end
            if direction.X < 0 then
                VelocityHandler.Velocity = VelocityHandler.Velocity + camera.CFrame.RightVector * (direction.X * (flySpeed * 50))
            end
            if direction.Z > 0 then
                VelocityHandler.Velocity = VelocityHandler.Velocity - camera.CFrame.LookVector * (direction.Z * (flySpeed * 50))
            end
            if direction.Z < 0 then
                VelocityHandler.Velocity = VelocityHandler.Velocity - camera.CFrame.LookVector * (direction.Z * (flySpeed * 50))
            end
        end
    end)
end

getgenv().namehub='Light Hub'

local ui = loadstring(game:HttpGet("https://raw.githubusercontent.com/wzaxk/check/refs/heads/main/uiloader"))()

local main = ui.new()

-- tabs with frappedevs icons (ids only)
local tabmain = main:create_tab('Main', '7734068321') -- home icon
local combat = main:create_tab('Combat', '7733984760') -- sword icon
local auto = main:create_tab('Auto', '7733779480') -- repeat/loop icon
local esp = main:create_tab('ESP', '7733685625') -- eye icon
local bring = main:create_tab('Bring', '7734023257') -- hand icon
local tp = main:create_tab('Teleport', '7733960981') -- location/arrow icon
local player = main:create_tab('Player', '7734053495') -- user icon
local misc = main:create_tab('Miscellaneous', '7733906317') -- settings/gear icon

tabmain.create_title({name = 'Welcome To Light Hub!', section = 'left'})
tabmain.create_title({name = 'Lead Developer - narodi', section = 'left'})
tabmain.create_title({name = '99 Nights in the forest is currently keyless!', section = 'left'})
tabmain.create_title({name = 'The script is getting huge improvments soon', section = 'left'})
tabmain.create_title({name = 'Enjoy because it wont be keyless for long', section = 'left'})


combat.create_toggle({
    name = 'Kill Aura',
    flag = 'killauraflag',
    section = 'left',
    enabled = false,
    callback = function(state)
        killAuraToggle = state
        if state then
            task.spawn(killAuraLoop)
        else
            local tool, _ = getAnyToolWithDamageID(false)
            unequipTool(tool)
        end
    end
})

combat.create_toggle({
    name = 'Chop Aura',
    flag = 'chopauraflag',
    section = 'left',
    enabled = false,
    callback = function(state)
        chopAuraToggle = state
        if state then
            task.spawn(chopAuraLoop)
        else
            local tool, _ = getAnyToolWithDamageID(true)
            unequipTool(tool)
        end
    end
})

combat.create_slider({
    name = 'Aura Radius',
    flag = 'sliderflauraradiusagname',
    section = 'left',
    value = 50,
    minimum_value = 50,
    maximum_value = 500,
    callback = function(value)
        auraRadius = math.clamp(value, 10, 500)
    end
})

auto.create_multidropdown({
    name = 'Select Foods',
    flag = 'selectoptionfoods',
    section = 'left',
    option = 'Select',
    options = alimentos,
    callback = function(value)
        selectedFood = value[1] or "Carrot"
    end
})

auto.create_slider({
    name = 'When to eat',
    flag = 'sliderflagnameeating',
    section = 'left',
    value = 50,
    minimum_value = 20,
    maximum_value = 100,
    callback = function(value)
        local n = tonumber(value)
        if n then
            hungerThreshold = math.clamp(n, 0, 100)
        end
    end
})

auto.create_toggle({
    name = 'Auto Eat',
    flag = 'toggleflagnameatingige',
    section = 'left',
    enabled = false,
    callback = function(state)
        autoFeedToggle = state
        if state then
            task.spawn(function()
                while autoFeedToggle do
                    task.wait(0.075)
                    if wiki(selectedFood) == 0 then
                        autoFeedToggle = false
                        notifeed(selectedFood)
                        break
                    end
                    if ghn() <= hungerThreshold then
                        feed(selectedFood)
                    end
                end
            end)
        end
    end
})

local autoUpgradeCampfireEnabled = false

auto.create_multidropdown({
    name = 'Select Items To Burn',
    flag = 'selectopaation',
    section = 'left',
    option = 'Select',
    options = campfireFuelItems,
    callback = function(value)
        for _, itemName in ipairs(campfireFuelItems) do
            alwaysFeedEnabledItems[itemName] = table.find(value, itemName) ~= nil
        end
    end
})

auto.create_toggle({
    name = 'Auto Upgrade Campfire',
    flag = 'toggleflagcampname',
    section = 'left',
    enabled = false,
    callback = function(state)
        autoUpgradeCampfireEnabled = state
        
        if state then
            task.spawn(function()
                while autoUpgradeCampfireEnabled do
                    for itemName, enabled in pairs(alwaysFeedEnabledItems) do
                        if enabled then
                            for _, item in ipairs(workspace:WaitForChild("Items"):GetChildren()) do
                                if item.Name == itemName then
                                    moveItemToPos(item, campfireDropPos)
                                end
                            end
                        end
                    end
                    task.wait(2)
                end
            end)
        end
    end
})

auto.create_multidropdown({
    name = 'Items To Cook',
    flag = 'selectosjhdjdption',
    section = 'left',
    option = 'Select',
    options = autocookItems,
    callback = function(value)
        for _, itemName in ipairs(autocookItems) do
            autoCookEnabledItems[itemName] = table.find(value, itemName) ~= nil
        end
    end
})

auto.create_toggle({
    name = 'Auto Cook',
    flag = 'toggleflagname',
    section = 'left',
    enabled = false,
    callback = function(state)
        autoCookEnabled = state
    end
})

coroutine.wrap(function()
    while true do
        if autoCookEnabled then
            for itemName, enabled in pairs(autoCookEnabledItems) do
                if enabled then
                    for _, item in ipairs(Workspace:WaitForChild("Items"):GetChildren()) do
                        if item.Name == itemName then
                            moveItemToPos(item, campfireDropPos)
                        end
                    end
                end
            end
        end
        task.wait(0.5)
    end
end)()

tp.create_button({
    name = 'Teleport to campfire',
    flag = 'buttonflaaksjjagname',
    section = 'left',
    callback = function()
        tp1()
    end
})

tp.create_button({
    name = 'Teleport to stronghold',
    flag = 'buttonflaaajjagname',
    section = 'left',
    callback = function()
        tp2()
    end
})

tp.create_dropdown({
    name = 'Select Child',
    flag = 'multiselectoaaaption',
    section = 'left',
    option = 'Select',
    options = currentMobNames,
    callback = function(option)
        selectedMob = option
    end
})

tp.create_button({
    name = 'Refresh List',
    flag = 'buttonfldjjcagname',
    section = 'left',
    callback = function()
        currentMobs, currentMobNames = getMobs()
        if #currentMobNames > 0 then
            selectedMob = currentMobNames[1]
        else
            selectedMob = nil
        end
    end
})

tp.create_button({
    name = 'Teleport To Child',
    flag = 'buttonflsjkseeagname',
    section = 'left',
    callback = function()
        if selectedMob and currentMobs then
            for i, name in ipairs(currentMobNames) do
                if name == selectedMob then
                    local targetMob = currentMobs[i]
                    if targetMob then
                        local part = targetMob.PrimaryPart or targetMob:FindFirstChildWhichIsA("BasePart")
                        if part and game.Players.LocalPlayer.Character then
                            local hrp = game.Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
                            if hrp then
                                hrp.CFrame = part.CFrame + Vector3.new(0, 5, 0)
                            end
                        end
                    end
                    break
                end
            end
        end
    end
})

bring.create_multidropdown({
    name = 'Select Items',
    flag = 'selectitems',
    section = 'left',
    option = 'Pick Items',
    options = {
        "Admin Axe","Admin Gun","Alien Armor","Alien Corpse","Alpha Wolf Pelt","Apple","Arctic Fox Hat","Arctic Fox Pelt","Axe",
        "Bandage","BBQ Ribs","Bear Corpse","Bear Pelt","Beast Ice Sword","Berry","Berry Seeds","Biofuel","Blowpipe","Bolt",
        "Blueprints","Blue Key","Cake","Carrot","Carrot Cake","Chainsaw","Chair","Char","Chili Seeds","Clownfish","Coal","Corn",
        "Crossbow","Cultist Corpse","Cultist Experiment","Cultist Gem","Cultist Prototype","Defensive Blueprint","Earmuffs","Eel",
        "Elite Alien Corpse","Feather","Flower Seeds","Forest Gem","Forest Gem Fragment","Frog Boots","Frog Key","Frozen Shuriken",
        "Fuel Canister","Furniture Blueprint","Giant Sack","Good Axe","Good Rod","Grey Key","Hammer","Hearty Stew","Ice Axe",
        "Ice Sword","Iron Body","Jar o' Jelly","Katana","Laser Cannon","Laser Sword","Log","Mammoth Tusk","Medkit","Metal Chair",
        "Morningstar","Morsel","Old Axe","Old Boot","Old Flashlight","Old Rod","Old Sack","Oil Barrel","Paint Brush",
        "Polar Bear Hat","Polar Bear Pelt","Pumpkin","Pumpkin Soup","Ray Gun","Red Key","Revolver","Revolver Ammo","Rifle",
        "Rifle Ammo","Riot Shield","Salmon","Shark","Sheet Metal","Snowball","Spear","Steak","Steak Dinner","Stew","Strong Axe",
        "Strong Flashlight","Strong Rod","Swordfish","Tactical Shotgun","Thorn Body","Trident","Tyre","UFO Component","UFO Junk",
        "UFO Scrap","Washing Machine","Wolf Corpse","Wolf Pelt","Wood","Yellow Key"
    },
    callback = function() end
})

bring.create_button({
    name = 'Bring',
    flag = 'autobring',
    section = 'left',
    callback = function(state)
        if state then
            local rs = game:GetService("ReplicatedStorage")
            local plrs = game:GetService("Players")
            local ws = game:GetService("Workspace")
            local plr = plrs.LocalPlayer
            local root = plr.Character and plr.Character:FindFirstChild("HumanoidRootPart")
            if not root then return end
            local savedpos = root.CFrame
            local store = rs.RemoteEvents.RequestBagStoreItem
            local drop = rs.RemoteEvents.RequestBagDropItem
            local startdrag = rs.RemoteEvents.RequestStartDraggingItem
            local stopdrag = rs.RemoteEvents.StopDraggingItem

            local function findsack()
                for _, v in pairs(plr.Inventory:GetChildren()) do
                    if v.Name:lower():find("sack") then
                        return v
                    end
                end
            end

            task.spawn(function()
                local sack = findsack()
                if not sack then return end

                local alreadyBrought = {}

                for _, wanted in ipairs(ui.Flags.selectitems or {}) do
                    while ui.Flags.autobring do
                        local found
                        for _, item in ipairs(ws.Items:GetChildren()) do
                            if item.Name == wanted and not alreadyBrought[item] then
                                found = item
                                break
                            end
                        end
                        if not found then
                            break
                        end
                        found:PivotTo(savedpos)
                        startdrag:FireServer(found)
                        stopdrag:FireServer(found)
                        store:InvokeServer(sack, found)
                        local sackitem = plr.ItemBag:FindFirstChild(found.Name)
                        if sackitem then
                            drop:FireServer(sack, sackitem, true)
                        end
                        alreadyBrought[found] = true
                        task.wait(0.2)
                    end
                end
            end)
        end
    end
})

player.create_slider({
    name = "Fly Speed",
    flag = "flyspeed",
    section = "left",
    value = 1,
    minimum_value = 1,
    maximum_value = 20,
    callback = function(value)
        flySpeed = value
        if FLYING then
            task.spawn(function()
                while FLYING do
                    task.wait(0.1)
                    if game:GetService("UserInputService").TouchEnabled then
                        local root = Players.LocalPlayer.Character and Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
                        if root and root:FindFirstChild("BodyVelocity") then
                            local bv = root:FindFirstChild("BodyVelocity")
                            bv.Velocity = bv.Velocity.Unit * (flySpeed * 50)
                        end
                    end
                end
            end)
        end
    end
})

player.create_toggle({
    name = "Enable Fly",
    flag = "enablefly",
    section = "left",
    enabled = false,
    callback = function(state)
        flyToggle = state
        if flyToggle then
            if game:GetService("UserInputService").TouchEnabled then
                MobileFly()
            else
                sFLY()
            end
        else
            NOFLY()
            UnMobileFly()
        end
    end
})

player.create_slider({
    name = "Speed",
    flag = "speedval",
    section = "left",
    value = 16,
    minimum_value = 16,
    maximum_value = 150,
    callback = function(value)
        speed = value
    end
})

player.create_toggle({
    name = "Enable Speed",
    flag = "enablespeed",
    section = "left",
    enabled = false,
    callback = function(state)
        setSpeed(state and speed or 16)
    end
})

player.create_toggle({
    name = "Noclip",
    flag = "noclip",
    section = "left",
    enabled = false,
    callback = function(state)
        if state then
            noclipConnection = RunService.Stepped:Connect(function()
                local char = Players.LocalPlayer.Character
                if char then
                    for _, part in ipairs(char:GetDescendants()) do
                        if part:IsA("BasePart") then
                            part.CanCollide = false
                        end
                    end
                end
            end)
        else
            if noclipConnection then
                noclipConnection:Disconnect()
                noclipConnection = nil
            end
        end
    end
})

player.create_toggle({
    name = "Inf Jump",
    flag = "infjump",
    section = "left",
    enabled = false,
    callback = function(state)
        if state then
            infJumpConnection = UserInputService.JumpRequest:Connect(function()
                local char = Players.LocalPlayer.Character
                local humanoid = char and char:FindFirstChildOfClass("Humanoid")
                if humanoid then
                    humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
                end
            end)
        else
            if infJumpConnection then
                infJumpConnection:Disconnect()
                infJumpConnection = nil
            end
        end
    end
})

esp.create_title({
    name = "Esp Items",
    section = "left"
})

esp.create_multidropdown({
    name = "Esp Items",
    flag = "espitems",
    section = "left",
    option = "Select Items",
    options = ie,
    callback = function(options)
        selectedItems = options
        if espItemsEnabled then
            for _, name in ipairs(ie) do
                if table.find(selectedItems, name) then
                    Aesp(name, "item")
                else
                    Desp(name, "item")
                end
            end
        else
            for _, name in ipairs(ie) do
                Desp(name, "item")
            end
        end
    end
})

esp.create_toggle({
    name = "Enable Esp Items",
    flag = "espitemsenable",
    section = "left",
    enabled = false,
    callback = function(state)
        espItemsEnabled = state
        for _, name in ipairs(ie) do
            if state and table.find(selectedItems, name) then
                Aesp(name, "item")
            else
                Desp(name, "item")
            end
        end
    end
})

esp.create_title({
    name = "Esp Entity",
    section = "left"
})

esp.create_multidropdown({
    name = "Esp Entity",
    flag = "espentity",
    section = "left",
    option = "Select Entity",
    options = me,
    callback = function(options)
        selectedMobs = options
        if espMobsEnabled then
            for _, name in ipairs(me) do
                if table.find(selectedMobs, name) then
                    Aesp(name, "mob")
                else
                    Desp(name, "mob")
                end
            end
        else
            for _, name in ipairs(me) do
                Desp(name, "mob")
            end
        end
    end
})

esp.create_toggle({
    name = "Enable Esp Entity",
    flag = "espentityenable",
    section = "left",
    enabled = false,
    callback = function(state)
        espMobsEnabled = state
        for _, name in ipairs(me) do
            if state and table.find(selectedMobs, name) then
                Aesp(name, "mob")
            else
                Desp(name, "mob")
            end
        end
    end
})

misc.create_title({
    name = "Miscellaneous",
    section = "left"
})

misc.create_toggle({
    name = "Instant Interact",
    flag = "instantinteract",
    section = "left",
    enabled = false,
    callback = function(state)
        instantInteractEnabled = state
        if state then
            originalHoldDurations = {}
            instantInteractConnection = task.spawn(function()
                while instantInteractEnabled do
                    for _, obj in ipairs(workspace:GetDescendants()) do
                        if obj:IsA("ProximityPrompt") then
                            if originalHoldDurations[obj] == nil then
                                originalHoldDurations[obj] = obj.HoldDuration
                            end
                            obj.HoldDuration = 0
                        end
                    end
                    task.wait(0.5)
                end
            end)
        else
            if instantInteractConnection then
                instantInteractEnabled = false
            end
            for obj, value in pairs(originalHoldDurations) do
                if obj and obj:IsA("ProximityPrompt") then
                    obj.HoldDuration = value
                end
            end
            originalHoldDurations = {}
        end
    end
})

misc.create_toggle({
    name = "Auto Stun Deer",
    flag = "autostundeer",
    section = "left",
    enabled = false,
    callback = function(state)
        if state then
            torchLoop = RunService.RenderStepped:Connect(function()
                pcall(function()
                    local remote = ReplicatedStorage:FindFirstChild("RemoteEvents")
                        and ReplicatedStorage.RemoteEvents:FindFirstChild("DeerHitByTorch")
                    local deer = workspace:FindFirstChild("Characters")
                        and workspace.Characters:FindFirstChild("Deer")
                    if remote and deer then
                        remote:InvokeServer(deer)
                    end
                end)
                task.wait(0.1)
            end)
        else
            if torchLoop then
                torchLoop:Disconnect()
                torchLoop = nil
            end
        end
    end
})
