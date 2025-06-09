/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.45912211358436, "KoPercent": 0.5408778864156438};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7471858276434766, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient return to activity vaccination page-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.5, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.9175257731958762, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.465, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.7746478873239436, 500, 1500, "5.9 Patient return to td_ipv vaccination page"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3235294117647059, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.37628865979381443, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9873949579831933, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9894957983193278, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.95, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.72, 500, 1500, "5.9 Patient return to activity vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.49159663865546216, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7552301255230126, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8886554621848739, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4894957983193277, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "5.9 Patient return to menacwy vaccination page-0"], "isController": false}, {"data": [0.907563025210084, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.8098591549295775, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [1.0, 500, 1500, "5.9 Patient return to td_ipv vaccination page-0"], "isController": false}, {"data": [0.7989690721649485, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9230769230769231, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8612167300380228, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8718487394957983, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9873949579831933, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9852941176470589, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.47, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9915966386554622, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9936974789915967, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4807, 26, 0.5408778864156438, 682.864780528396, 0, 28320, 314.0, 899.0, 1209.5999999999995, 8083.52, 1.4793277260237043, 36.82032960145705, 1.4641607916642174], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 10, 0, 0.0, 144.7, 141, 152, 144.0, 151.5, 152.0, 152.0, 0.7237461098646595, 0.525139999638127, 0.5781487479192299], "isController": false}, {"data": ["5.9 Patient return to activity vaccination page-0", 25, 0, 0.0, 0.31999999999999995, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.009568491645941314, 0.04302083548624395, 0.0], "isController": false}, {"data": ["1.4 Select Organisations-1", 10, 0, 0.0, 231.8, 225, 239, 232.5, 238.7, 239.0, 239.0, 0.7189589474441009, 9.807751500826802, 0.4647957257890574], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 13988.609999999997, 8786, 39320, 10669.0, 23870.000000000007, 31171.099999999977, 39273.879999999976, 0.03510593743209195, 11.25451237457965, 0.15141355373542972], "isController": true}, {"data": ["1.3 Sign-in-1", 10, 0, 0.0, 147.9, 144, 154, 146.0, 154.0, 154.0, 154.0, 0.6775526797208483, 6.094004082254895, 0.44729063622196624], "isController": false}, {"data": ["1.3 Sign-in-0", 10, 0, 0.0, 373.0, 364, 392, 370.5, 390.5, 392.0, 392.0, 0.6676904587033451, 0.47403414402083194, 0.6096587684449489], "isController": false}, {"data": ["1.4 Select Organisations", 10, 0, 0.0, 376.8999999999999, 367, 392, 376.0, 391.0, 392.0, 392.0, 0.711591830925781, 10.223573258378993, 1.0284725681349178], "isController": false}, {"data": ["2.4 Patient attending session-1", 97, 0, 0.0, 874.4639175257736, 653, 1477, 798.0, 1173.8, 1243.6, 1477.0, 0.03434853923098932, 3.0076975668442048, 0.0229437508144499], "isController": false}, {"data": ["2.4 Patient attending session-0", 97, 0, 0.0, 422.01030927835063, 201, 5800, 248.0, 512.2, 558.3, 5800.0, 0.03435374583328021, 0.02553046931555297, 0.028113709969032046], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 1041.9500000000003, 663, 7870, 877.5, 1209.6000000000001, 1574.2499999999993, 7853.1099999999915, 0.035346805179013896, 3.725619541127775, 0.030485583915966504], "isController": false}, {"data": ["5.9 Patient return to td_ipv vaccination page", 71, 0, 0.0, 481.5352112676055, 275, 772, 333.0, 714.1999999999999, 737.4, 772.0, 0.025028474295933155, 0.7777626616099161, 0.017427052903320646], "isController": false}, {"data": ["1.2 Sign-in page", 10, 0, 0.0, 140.0, 136, 148, 139.5, 147.5, 148.0, 148.0, 1.2856775520699408, 7.7479650134996145, 0.7746709469015172], "isController": false}, {"data": ["3.0 Nurse triage", 238, 0, 0.0, 1615.7815126050432, 1052, 14659, 1325.0, 1687.8, 1820.6499999999999, 12691.869999999933, 0.07760597944289341, 9.04515599087184, 0.2336665626689479], "isController": true}, {"data": ["4.2 Vaccination batch-2", 96, 0, 0.0, 0.5416666666666665, 0, 6, 0.0, 1.0, 1.0, 6.0, 0.03395133006103813, 0.17039420478204484, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 97, 0, 0.0, 1296.6288659793809, 867, 6698, 1046.0, 1694.0, 1779.7999999999997, 6698.0, 0.03434523118235406, 3.032932042206394, 0.051048283065959835], "isController": false}, {"data": ["4.2 Vaccination batch-0", 238, 0, 0.0, 254.90336134453764, 144, 11824, 159.0, 174.0, 216.04999999999896, 4954.4099999999635, 0.07858507246831421, 0.0587856403321375, 0.07060377604575103], "isController": false}, {"data": ["4.2 Vaccination batch-1", 238, 0, 0.0, 328.3655462184874, 237, 14503, 256.0, 285.1, 310.04999999999995, 1008.0499999999896, 0.07859002884055932, 1.0693602743790893, 0.05646916980036152], "isController": false}, {"data": ["1.1 Homepage", 10, 0, 0.0, 443.7, 402, 629, 425.5, 609.9000000000001, 629.0, 629.0, 1.1065619121389842, 5.711112993803253, 0.5997479113643908], "isController": false}, {"data": ["1.3 Sign-in", 10, 0, 0.0, 521.8, 515, 546, 517.5, 544.5, 546.0, 546.0, 0.6608948516291058, 6.413390762342211, 1.0397476620844623], "isController": false}, {"data": ["5.9 Patient return to activity vaccination page", 25, 0, 0.0, 476.08, 267, 806, 560.0, 731.8, 784.0999999999999, 806.0, 0.009567488297048315, 0.17996669724754844, 0.006680423957411665], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 9370.200000000004, 6216, 28320, 7094.5, 16691.9, 20390.549999999985, 28298.87999999999, 0.035175002673300204, 0.611084260553732, 0.023004589150692527], "isController": false}, {"data": ["3.3 Nurse triage complete", 238, 0, 0.0, 332.61344537815165, 269, 755, 304.0, 371.1, 691.05, 748.4399999999999, 0.07752796544467826, 1.9760965789156508, 0.052550047579531314], "isController": false}, {"data": ["4.3 Vaccination confirm", 238, 0, 0.0, 1017.8109243697482, 716, 9786, 847.5, 1256.2, 1312.6, 5325.169999999955, 0.07941240161454087, 2.0796399641284506, 0.18486863785292224], "isController": false}, {"data": ["4.1 Vaccination questions", 239, 1, 0.41841004184100417, 584.8200836820084, 167, 6890, 468.0, 712.0, 730.0, 1294.1999999999985, 0.07809311640220111, 0.9063483847672351, 0.1605561874867054], "isController": false}, {"data": ["3.1 Nurse triage new", 238, 0, 0.0, 429.7899159663865, 231, 13404, 256.0, 523.0, 535.0, 7333.50999999994, 0.07762731777068695, 0.8748773134693834, 0.05352708575714848], "isController": false}, {"data": ["3.2 Nurse triage result", 238, 0, 0.0, 853.3781512605046, 535, 13715, 718.0, 903.0999999999999, 1125.25, 5587.419999999963, 0.07753213267116114, 6.186541626590752, 0.12742989073425862], "isController": false}, {"data": ["1.0 Login", 10, 0, 0.0, 2028.5, 1682, 4647, 1715.5, 4372.6, 4647.0, 4647.0, 0.9651578033008397, 45.35581899671846, 4.594867471769134], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page-0", 71, 0, 0.0, 0.5070422535211268, 0, 1, 1.0, 1.0, 1.0, 1.0, 0.025050480245932205, 0.1275133669450798, 0.0], "isController": false}, {"data": ["3.2 Nurse triage result-1", 238, 0, 0.0, 482.23109243697485, 312, 2517, 464.0, 592.1, 604.0999999999999, 736.5399999999984, 0.07754607719483908, 6.130175986830851, 0.055188960729428374], "isController": false}, {"data": ["3.2 Nurse triage result-0", 238, 0, 0.0, 370.91176470588215, 215, 13250, 259.0, 345.69999999999993, 518.4999999999998, 5117.6599999999635, 0.07754390434861654, 0.05747670821808996, 0.07226182404033717], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 71, 0, 0.0, 700.8732394366197, 267, 15561, 314.0, 722.2, 784.9999999999999, 15561.0, 0.025047908534916077, 0.7596833180355878, 0.017465045599541092], "isController": false}, {"data": ["4.0 Vaccination", 264, 26, 9.848484848484848, 1986.9431818181793, 133, 16594, 1928.5, 2177.5, 2374.5, 11791.65000000006, 0.08523021682373455, 4.202394547885177, 0.4685357264124568], "isController": true}, {"data": ["5.9 Patient return to td_ipv vaccination page-0", 71, 0, 0.0, 0.4084507042253521, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.025034501774628837, 0.12672304751601327, 0.0], "isController": false}, {"data": ["2.5 Patient return to consent page", 97, 0, 0.0, 623.4329896907218, 268, 16348, 317.0, 742.2, 791.5999999999999, 16348.0, 0.03436355507627646, 0.7902655897618571, 0.02382629307046513], "isController": false}, {"data": ["1.5 Open Sessions list", 13, 0, 0.0, 477.53846153846155, 237, 3223, 250.0, 2036.599999999999, 3223.0, 3223.0, 0.0063274812244162905, 0.07424903749275989, 0.0038572348359478805], "isController": false}, {"data": ["4.2 Vaccination batch", 263, 25, 9.505703422053232, 541.9657794676801, 133, 14660, 415.0, 464.0, 667.7999999999997, 8295.240000000082, 0.08683258182980352, 1.3240637119005538, 0.1339989832457689], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 238, 0, 0.0, 389.26470588235287, 231, 8875, 286.5, 549.0, 578.2499999999999, 957.4099999999929, 0.07942525482825458, 0.0598791960228638, 0.07614737268432], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 238, 0, 0.0, 281.49579831932766, 220, 5922, 238.5, 269.2, 310.15, 1929.2999999999656, 0.07942716328889862, 0.059499650900096644, 0.0535978221021767], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 238, 0, 0.0, 346.75630252100837, 265, 715, 311.5, 451.1, 477.15, 548.22, 0.07942628856638553, 1.9606246625217045, 0.05515537048108637], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 1706.2799999999993, 659, 22060, 917.0, 1327.2, 10355.999999999938, 22000.56999999997, 0.0353127669424476, 3.1603253884978195, 0.023405053636561708], "isController": false}, {"data": ["4.1 Vaccination questions-0", 238, 0, 0.0, 308.28151260504205, 160, 1133, 206.0, 459.1, 467.0, 838.7999999999988, 0.07841948493555105, 0.05850828758863379, 0.10528962644894825], "isController": false}, {"data": ["4.1 Vaccination questions-1", 238, 0, 0.0, 278.10924369747914, 228, 6707, 246.0, 268.1, 280.09999999999997, 508.0799999999996, 0.07841855475262571, 0.8539646499945963, 0.05619279955393681], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 26, 100.0, 0.5408778864156438], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4807, 26, "422/Unprocessable Entity", 26, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 239, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 263, 25, "422/Unprocessable Entity", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
