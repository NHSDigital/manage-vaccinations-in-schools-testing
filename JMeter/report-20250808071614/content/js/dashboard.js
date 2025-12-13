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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1149735149451381, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.11253196930946291, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.11472602739726027, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.08016032064128256, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.13013698630136986, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9071428571428571, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5285714285714286, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.08601756954612005, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.0959079283887468, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [1.0, 500, 1500, "Select Teams"], "isController": true}, {"data": [0.11253196930946291, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.0, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.2535211267605634, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.09224011713030747, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.045090180360721446, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.32142857142857145, 500, 1500, "1.4 Select Team"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8629, 0, 0.0, 3584.1235369104206, 0, 17455, 3049.0, 7101.0, 8506.5, 11384.200000000012, 2.4557319384601373, 58.14206031470024, 3.2833682542254583], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 53212.0, 53212, 53212, 53212.0, 53212.0, 53212.0, 53212.0, 0.018792753514244906, 4.301118051379388, 0.30134473896865366], "isController": true}, {"data": ["2.0 Register attendance", 498, 0, 0.0, 19734.82730923693, 5748, 45066, 19786.5, 29444.9, 32388.35, 38600.189999999995, 0.1668239434567328, 32.91786061042991, 0.6349072914876576], "isController": true}, {"data": ["2.5 Select patient", 391, 0, 0.0, 2832.9744245524307, 827, 8209, 2448.0, 5074.200000000001, 6258.599999999997, 6898.799999999998, 0.13253275864055963, 3.091502429993214, 0.09189283069804428], "isController": false}, {"data": ["2.5 Select menacwy", 292, 0, 0.0, 3110.232876712329, 822, 12504, 2773.0, 5685.8, 6568.249999999994, 9426.299999999997, 0.09892054647504087, 2.539825259564804, 0.06897389666326091], "isController": false}, {"data": ["2.3 Search by first/last name", 499, 0, 0.0, 3392.8617234468943, 1003, 11452, 2988.0, 6051.0, 7233.0, 10695.0, 0.16764853609903022, 8.805783192058364, 0.13086550709062594], "isController": false}, {"data": ["2.5 Select td_ipv", 292, 0, 0.0, 2796.9897260273965, 835, 9621, 2445.0, 5165.0, 5870.999999999996, 7889.38999999999, 0.09821986584242708, 2.5535742775752275, 0.06838941830629933], "isController": false}, {"data": ["4.0 Vaccination for flu", 391, 0, 0.0, 12297.746803069038, 3992, 29361, 12187.0, 17703.2, 19598.8, 22556.44, 0.13215013336686093, 6.47083407372051, 0.7959934481332696], "isController": true}, {"data": ["4.0 Vaccination for hpv", 391, 0, 0.0, 12140.710997442453, 4008, 25643, 12142.0, 17937.0, 20282.999999999996, 24913.64, 0.13225218021608856, 6.21942811216693, 0.8021309565908432], "isController": true}, {"data": ["5.8 Consent confirm", 4, 0, 0.0, 8465.25, 4517, 15114, 7115.0, 15114.0, 15114.0, 15114.0, 0.005328466667110706, 0.548696773613433, 0.011784809457362277], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 178.84285714285718, 104, 2005, 114.0, 191.79999999999995, 482.00000000000017, 2005.0, 0.07892161505193042, 0.4736838340909808, 0.04755335594437605], "isController": false}, {"data": ["Get correct patient name", 498, 0, 0.0, 0.5080321285140565, 0, 94, 0.0, 1.0, 1.0, 2.009999999999991, 0.1673784733133846, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 4, 0, 0.0, 3271.5, 1999, 5412, 2837.5, 5412.0, 5412.0, 5412.0, 0.005321321337301265, 0.14099942562987816, 0.0039741020436534595], "isController": false}, {"data": ["2.4 Patient attending session", 391, 0, 0.0, 5152.485933503844, 1579, 13409, 4893.0, 8090.4, 9391.4, 12777.479999999996, 0.13232679235117298, 7.2746765142956935, 0.19668103316258326], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 129.0, 129, 129, 129.0, 129.0, 129.0, 129.0, 7.751937984496124, 37.14722625968992, 5.662548449612403], "isController": false}, {"data": ["5.4 Consent route", 4, 0, 0.0, 4378.25, 2530, 7516, 3733.5, 7516.0, 7516.0, 7516.0, 0.005305131255578677, 0.06470679990172244, 0.00845893853275985], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 478.2285714285714, 311, 2915, 333.5, 603.6999999999999, 1539.3500000000001, 2915.0, 0.0788697736099484, 0.4414088599205218, 0.04274680112648571], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 782.1999999999999, 489, 3256, 643.0, 1105.6999999999998, 1997.150000000003, 3256.0, 0.07830678360479684, 0.8323154616744228, 0.12258376378758726], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 292, 0, 0.0, 11752.616438356172, 3929, 33113, 11699.5, 18071.5, 19900.1, 28752.89999999999, 0.09811738939196453, 5.072747589004568, 0.5956842666203969], "isController": true}, {"data": ["2.1 Open session", 499, 0, 0.0, 6706.817635270544, 2426, 16163, 6473.0, 9822.0, 11075.0, 13875.0, 0.16779950951429945, 3.009095205246711, 0.10939170061187974], "isController": false}, {"data": ["4.3 Vaccination confirm", 1366, 0, 0.0, 5780.735724743776, 1688, 17455, 5426.5, 9449.3, 10866.649999999998, 14035.979999999992, 0.4167550160859504, 8.984238245109765, 0.9700450419958477], "isController": false}, {"data": ["5.6 Consent questions", 4, 0, 0.0, 3351.25, 2108, 5168, 3064.5, 5168.0, 5168.0, 5168.0, 0.005338921404403276, 0.0673009103695201, 0.013361641434701654], "isController": false}, {"data": ["4.1 Vaccination questions", 1366, 0, 0.0, 3140.1493411420215, 948, 11449, 2823.0, 5548.899999999999, 6447.599999999997, 8153.699999999986, 0.4169285187347715, 5.016033236944049, 0.87979540762851], "isController": false}, {"data": ["5.3 Consent parent details", 4, 0, 0.0, 4593.75, 1697, 10025, 3326.5, 10025.0, 10025.0, 10025.0, 0.005280179526103887, 0.06185132169493763, 0.009744354745561349], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 4, 0, 0.0, 4903.75, 2612, 7363, 4820.0, 7363.0, 7363.0, 7363.0, 0.005271745290354552, 0.08110971391556246, 0.008410853386832763], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 5010.142857142858, 2985, 9949, 4130.0, 8794.9, 9693.5, 9949.0, 0.078161376444171, 4.739525730027256, 0.37195350333246613], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 292, 0, 0.0, 11853.147260273978, 3919, 29512, 11899.5, 17544.699999999997, 19018.799999999992, 24149.259999999987, 0.09880694003704583, 4.77619803784898, 0.6000900423710891], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 37033.0, 37033, 37033, 37033.0, 37033.0, 37033.0, 37033.0, 0.027002943320821968, 6.189317213701293, 0.4329173051737639], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 391, 0, 0.0, 3093.6547314578024, 855, 11398, 2721.0, 5277.0, 6346.199999999997, 9679.759999999986, 0.13240964903992847, 3.2336333625709757, 0.09866070529049356], "isController": false}, {"data": ["Select Teams", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select flu", 391, 0, 0.0, 3045.0204603580582, 816, 11502, 2716.0, 5611.000000000001, 6443.6, 9033.719999999994, 0.1323409006830618, 3.1790903238493535, 0.09175980418454481], "isController": false}, {"data": ["5.1 Consent start", 4, 0, 0.0, 3650.5, 1551, 6147, 3452.0, 6147.0, 6147.0, 6147.0, 0.005275430211333735, 0.06848657262882601, 0.011429240160003799], "isController": false}, {"data": ["5.5 Consent agree", 4, 0, 0.0, 3913.0, 2427, 5677, 3774.0, 5677.0, 5677.0, 5677.0, 0.005349803595335506, 0.09300377554029672, 0.008430903859348313], "isController": false}, {"data": ["1.5 Open Sessions list", 71, 0, 0.0, 1925.0281690140844, 1097, 4585, 1497.0, 3397.1999999999994, 4183.4, 4585.0, 0.04222586197257817, 0.9988643110954697, 0.025267332266684272], "isController": false}, {"data": ["4.2 Vaccination batch", 1366, 0, 0.0, 3120.3448023426067, 926, 14983, 2739.5, 5515.4, 6411.899999999996, 8670.84999999999, 0.4170367129691396, 6.36936682498517, 0.6749495008916221], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 0, 0.0, 36718.0, 36718, 36718, 36718.0, 36718.0, 36718.0, 36718.0, 0.027234598834359167, 6.16448761506618, 0.436391892259927], "isController": true}, {"data": ["5.7 Consent triage", 4, 0, 0.0, 3557.0, 2719, 4773, 3368.0, 4773.0, 4773.0, 4773.0, 0.005352244597578109, 0.08994279788586339, 0.009037139559777882], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 33374.0, 33374, 33374, 33374.0, 33374.0, 33374.0, 33374.0, 0.029963444597590937, 6.884218441001977, 0.4680032547791694], "isController": true}, {"data": ["2.2 Session register", 499, 0, 0.0, 3363.4268537074145, 1034, 10763, 2927.0, 5947.0, 6865.0, 9576.0, 0.16766701264088313, 10.941771148618997, 0.11077895922633937], "isController": false}, {"data": ["1.4 Select Team", 70, 0, 0.0, 1648.5857142857146, 908, 4898, 1259.0, 3207.2, 3588.7000000000003, 4898.0, 0.07800529321632539, 1.1509589601615824, 0.1131990876166597], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8629, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
